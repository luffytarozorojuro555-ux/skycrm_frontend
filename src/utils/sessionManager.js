import api from '../services/api';
import { clearToken, getToken } from './auth';

class SessionManager {
  constructor() {
    this.isLoggingOut = false;
    this.isNavigating = false;
    this.isReloading = false; // flag set when user triggers a reload via keyboard
    this.heartbeatIntervalId = null;
    this.lastReloadTime = 0; // Track last reload time
    this.setupEventListeners();
    
    // Detect page reload vs new page load
    const pageLoadTime = Date.now();
    const lastUnloadTime = parseInt(sessionStorage.getItem('lastUnloadTime') || '0');
    if (lastUnloadTime && pageLoadTime - lastUnloadTime < 2000) {
      // This is likely a reload (within 2 seconds of last unload)
      this.isReloading = true;
      setTimeout(() => { this.isReloading = false; }, 1500);
    }
    sessionStorage.setItem('lastUnloadTime', '0'); // Reset for next unload
  }

  setupEventListeners() {
    // Only setup listeners if user is logged in
    if (getToken()) {
      // Track reload events (keyboard, button click, and programmatic)
      window.addEventListener('keydown', (e) => {
        // F5, Ctrl+R / Cmd+R
        if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
          this.isReloading = true;
          this.lastReloadTime = Date.now();
          setTimeout(() => { this.isReloading = false; }, 1500);
        }
      });
      
      // Listen for reload button clicks
      window.addEventListener('click', (e) => {
        // Check if clicked element is the refresh button (browser-specific)
        if (e.target.closest('.reload-button, .refresh-button')) {
          this.isReloading = true;
          this.lastReloadTime = Date.now();
          setTimeout(() => { this.isReloading = false; }, 1500);
        }
      });

      // Handle tab close/refresh (we still listen but will skip logout when reload is detected)
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      
  // Handle visibility change (tab switching, minimizing, etc.)
  // We'll keep visibility change but use heartbeat to avoid logout on short switches
  document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

  // Handle page unload
  window.addEventListener('unload', this.handleUnload.bind(this));
      
      // Handle navigation within the app
      window.addEventListener('popstate', this.handleNavigation.bind(this));
    }
  }

  async handleBeforeUnload(event) {
    // Only trigger pending logout if not a reload or navigation
    if (this.isReloading) return;
    if (!this.isLoggingOut && !this.isNavigating && getToken()) {
      try {
        // Send pending logout to backend (do not clear token)
        // Use navigator.sendBeacon or fetch with keepalive so the request is sent during unload
        const token = getToken();
        await this.sendLogoutBeacon(token);
      } catch (e) {
        console.warn('Failed to set pending logout', e);
      }
    }
  }

  async handleVisibilityChange() {
    // We won't log the user out on visibility changes. Instead the heartbeat will keep the server session alive.
    // However, keep an eye for long hidden durations (e.g., user left device)
    
    if (document.hidden && !this.isLoggingOut && !this.isNavigating && getToken()) {
      // If tab is hidden for a long time (> 30 minutes), optionally logout — conservative choice: do nothing here.
      // The heartbeat (every 30s) will maintain the session while the tab is active or quickly switched.
    }
  }

  async handleUnload() {
    // Store unload time in sessionStorage to detect reloads
    sessionStorage.setItem('lastUnloadTime', Date.now().toString());
    // Skip if we detected a reload via any method
    if (this.isReloading || (Date.now() - this.lastReloadTime < 2000)) return;
    if (!this.isLoggingOut && !this.isNavigating && getToken()) {
      try {
        // Use beacon-friendly endpoint so the request reaches the server when tab/window closes
        const token = getToken();
        await this.sendLogoutBeacon(token);
        // Clear local token and stop heartbeat
        clearToken();
        this.stopHeartbeat();
      } catch (e) {
        console.warn('Failed to set pending logout on unload', e);
      }
    }
  }

  // Use navigator.sendBeacon if available (fast & reliable during unload),
  // otherwise use fetch with keepalive. Returns a Promise that resolves after attempting.
  async sendLogoutBeacon(token) {
    if (!token) return;
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const url = `${base.replace(/\/$/, '')}/auth/logout-beacon`;

      // Try sendBeacon first
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try {
          const blob = new Blob([JSON.stringify({ token })], { type: 'application/json' });
          const ok = navigator.sendBeacon(url, blob);
          if (ok) return;
          // fallthrough to fetch if sendBeacon reported failure
        } catch (err) {
          // fallthrough to fetch
        }
      }

      // Fallback: use fetch with keepalive (supported in modern browsers)
      if (typeof fetch === 'function') {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          keepalive: true
        });
      }
    } catch (err) {
      // best-effort only; nothing more we can do during unload
      console.warn('sendLogoutBeacon failed', err);
    }
  }

  handleNavigation() {
    // Mark as navigating to prevent logout
    this.isNavigating = true;
    setTimeout(() => {
      this.isNavigating = false;
    }, 500);
  }

  async performLogout() {
    this.isLoggingOut = true;
    try {
      // Clear token from localStorage immediately
      await api.post('/auth/logout');
      clearToken();
      // Stop heartbeat when logging out
      this.stopHeartbeat();

      // Send logout request to backend to clear Redis session

      console.log('Session cleared due to tab close');
    } catch (error) {
      // Even if the API call fails, we've cleared the local token
      console.error('Error during automatic logout:', error);
    }
  }

  // Method to manually trigger logout (for normal logout button)
  async manualLogout() {
    this.isLoggingOut = true;
    await this.performLogout();
  }

  startHeartbeat() {
    // heartbeat every 30 seconds to refresh server-side session TTL
    if (this.heartbeatIntervalId) return;
    this.heartbeatIntervalId = setInterval(async () => {
      try {
        await api.post('/auth/heartbeat');
        // Cancel pending logout if any
        await api.post('/session/cancel-pending-logout');
      } catch (e) {
        // if heartbeat fails with 401, clear token and redirect
        if (e.response && e.response.status === 401) {
          clearToken();
          window.location.href = '/login/select';
        }
      }
    }, 30 * 1000);
  }

  stopHeartbeat() {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  // Method to prevent logout (for navigation within the app)
  preventLogout() {
    this.isNavigating = true;
    // Reset the flag after a short delay
    setTimeout(() => {
      this.isNavigating = false;
    }, 100);
  }

  // Validate session with backend
  async validateSession() {
    try {
      const response = await api.get('/auth/validate-session');
      return response.data.valid;
    } catch (error) {
      throw error;
    }
  }

  // Method to reinitialize listeners after login
  reinitialize() {
    this.isLoggingOut = false;
    this.isNavigating = false;
    this.setupEventListeners();
    this.startHeartbeat();
    // Start with a quick initial heartbeat
    this.fastInitialHeartbeat();
  }

  // Run fast heartbeats initially after login/reload
  async fastInitialHeartbeat() {
    const FAST_INTERVAL = 2000; // 2 seconds
    const FAST_DURATION = 10000; // 10 seconds
    const startTime = Date.now();
    const quickBeat = async () => {
      if (Date.now() - startTime > FAST_DURATION) return;
      try {
        await api.post('/auth/heartbeat');
        // Cancel pending logout if any
        await api.post('/session/cancel-pending-logout');
        setTimeout(quickBeat, FAST_INTERVAL);
      } catch (error) {
        console.warn('Fast heartbeat failed:', error);
      }
    };
    quickBeat();
  }
}

// Create and export a singleton instance
const sessionManager = new SessionManager();
export default sessionManager;


