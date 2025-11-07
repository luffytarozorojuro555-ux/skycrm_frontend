import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { getUserFromToken, clearToken } from "../utils/auth";
import api from "../services/api";
import handleLogout from "../logoutHandler";
import { jwtDecode } from "jwt-decode";
import {
  X,
  Cog,
  Briefcase,
  Users,
  Target,
  LogOut,
  User,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const nav = useNavigate();
  const user = getUserFromToken();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [firstLetter, setFirstLetter] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
  const dropdownRef = useRef(null);

  // ✅ Detect clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const DecodeToken = localStorage.getItem("token");
    if (DecodeToken) {
      try {
        const decoded = jwtDecode(DecodeToken);
        const username =
          decoded.username || decoded.name || decoded.user || decoded.email;
        if (username) {
          setFirstLetter(username.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  return (
    <>
      {/* Profile Dropdown in top-right corner */}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-gray-200 border-r border-gray-700 shadow-md transition-all duration-300 z-20 flex flex-col ${
          sidebarOpen ? "w-60" : "w-20"
        }`}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          {sidebarOpen ? (
            <h2 className="text-2xl font-bold text-gray-100">SkyCRM</h2>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-200 font-bold text-2xl p-2"
            >
              ☰
            </button>
          )}

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-200 ml-2"
            >
              <X />
            </button>
          )}
        </div>

        {/* User Info */}
        {user && sidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="User"
                className="w-10 h-10 bg-gray-700 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold text-lg uppercase">
                {firstLetter || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-100">{user.name}</p>
              <p className="text-xs text-gray-400">{user.roleName}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2 pt-2 flex-1">
          {user?.roleName === "Admin" && (
            <>
              <SidebarLink
                to="/admin"
                label="Admin"
                icon={<Cog className="text-indigo-500" />}
                sidebarOpen={sidebarOpen}
              />
              <SidebarLink
                to="/manager"
                label="Manager"
                icon={<Briefcase className="text-green-500" />}
                sidebarOpen={sidebarOpen}
              />
              <SidebarLink
                to="/teamlead"
                label="Team Lead"
                icon={<Users className="text-yellow-500" />}
                sidebarOpen={sidebarOpen}
              />
              <SidebarLink
                to="/rep"
                label="Sales Rep"
                icon={<Target className="text-blue-500" />}
                sidebarOpen={sidebarOpen}
              />
            </>
          )}
          {user?.roleName === "Manager" && (
            <SidebarLink
              to="/manager"
              label="Manager"
              icon={<Briefcase className="text-green-500" />}
              sidebarOpen={sidebarOpen}
            />
          )}
          {user?.roleName === "TeamLead" && (
            <SidebarLink
              to="/teamlead"
              label="Team Lead"
              icon={<Users className="text-yellow-500" />}
              sidebarOpen={sidebarOpen}
            />
          )}
          {user?.roleName === "SalesRep" && (
            <SidebarLink
              to="/rep"
              label="Sales Rep"
              icon={<Target className="text-blue-500" />}
              sidebarOpen={sidebarOpen}
            />
          )}
        </nav>
        <div
          ref={dropdownRef}
          className="fixed top-4 right-4 z-50 flex flex-col items-end"
        >
          {/* Main Floating Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-3 rounded-full bg-gray-400 shadow-lg text-gray-800 
                   hover:bg-gray-700 hover:text-white transition-all duration-200 
                   flex items-center justify-center"
            aria-label="Open menu"
          >
            {dropdownOpen ? <X size={20} /> : <User size={20} />}
          </button>

          {/* Expanded Menu */}
          {dropdownOpen && (
            <div className="mt-2 flex flex-col items-end space-y-2 animate-fadeIn">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 rounded-full bg-gray-700 shadow-lg text-gray-300 
                       hover:bg-gray-700 hover:text-white transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Info Dropdown */}
              <div className="w-48 bg-gray-700 rounded-lg shadow-lg ring-1 ring-white ring-opacity-10 text-gray-200">
                <div className="px-4 py-2 border-b border-gray-600">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-gray-400">{user?.roleName}</div>
                </div>
                <button
                  onClick={() => {
                    nav("/change-password");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition"
                >
                  <span className="flex items-center gap-2">
                    <Cog size={16} /> Change Password
                  </span>
                </button>
                <button
                  onClick={() => handleLogout(nav)}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-600 transition"
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ to, label, icon, sidebarOpen }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-5 px-3 py-2 text-m rounded-lg transition-colors duration-300
        ${
          isActive
            ? " text-gray-50 font-semibold"
            : "text-gray-400 hover:bg-gray-100 hover:text-black"
        }`
      }
    >
      {icon}
      {sidebarOpen && <span>{label}</span>}
    </NavLink>
  );
}
