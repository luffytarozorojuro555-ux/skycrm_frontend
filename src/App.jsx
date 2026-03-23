import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import AllLogin from './pages/AllLogin.jsx';
import HomeRouter from './pages/HomeRouter.jsx';
import LeadDetailPage from './pages/LeadDetailPage.jsx';
import React, { useState, createContext, useEffect } from "react";
import Login from "./components/Login";
import OTPInput from "./components/OTPInput";
import Reset from "./components/Reset";
import Recovered from "./components/Recovered";
import sessionManager from './utils/sessionManager';
import { getToken, clearToken, isTokenExpired } from "./utils/auth";

export const RecoveryContext = createContext();

import { useLocation } from 'react-router-dom';
function OTPFlow() {
  const location = useLocation();
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState(location.state?.email || "");
  const [role, setRole] = useState(location.state?.role || "");
  const [otp, setOTP] = useState("");
  function NavigateComponents() {
    if (page === "login") return <Login />;
    if (page === "otp") return <OTPInput />;
    if (page === "reset") return <Reset />;
    return <Recovered />;
  }
  return (
    <RecoveryContext.Provider value={{ page, setPage, otp, setOTP, setEmail, email, role, setRole }}>
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <NavigateComponents />
      </div>
    </RecoveryContext.Provider>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize session manager when app loads
    console.log('Session manager initialized');
  }, []);

  return (
    <Routes>
      <Route path="/login/select" element={<AllLogin />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<OTPFlow />} />
      <Route path="/leads/:id" element={<Protected><LeadDetailPage /></Protected>} />
      <Route path="/*" element={<Protected><HomeRouter /></Protected>} />
    </Routes>
  );
}

function Protected({ children }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
const token = getToken();

  // useEffect(() => {
  //   async function validateSession() {
  //     if (!token) {
  //       setIsValidating(false);
  //       return;
  //     }

  //     try {
  //       await sessionManager.validateSession();
  //       setIsValid(true);
  //     } catch (error) {
  //       console.error('Session validation failed:', error);
  //       // Clear invalid token
  //       localStorage.removeItem('token');
  //     } finally {
  //       setIsValidating(false);
  //     }
  //   }

  //   validateSession();
  // }, [token]);

  useEffect(() => {
  async function validateSession() {
    const token = getToken();

    // 🔥 STEP 1: No token
    if (!token) {
      setIsValidating(false);
      return;
    }

    // 🔥 STEP 2: Expired token (CRITICAL FIX)
    if (isTokenExpired()) {
      clearToken();
      setIsValid(false);
      setIsValidating(false);
      return;
    }

    try {
      // 🔥 STEP 3: Validate with backend
      await sessionManager.validateSession();
      setIsValid(true);
    } catch (error) {
      console.error('Session validation failed:', error);

      // ❗ DO NOT immediately clear token (THIS WAS YOUR BUG)
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  }

  validateSession();
}, []);

  if (isValidating) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!token || !isValid) {
    return <Navigate to="/login/select" replace />;
  }

  return children;
}
