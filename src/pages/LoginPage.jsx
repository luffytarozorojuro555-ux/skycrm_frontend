import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { setToken } from "../utils/auth";
import sessionManager from "../utils/sessionManager";

import {
  ShieldCheck,
  Users,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

const roleThemes = {
  Admin: {
    img: "/admin-dashboard-with-security-controls-and-user-ma.jpg",
    icon: <ShieldCheck className="w-14 h-14 text-white" />,
    title: "Admin Login",
  },
  "Sales Manager": {
    img: "/sales-team-management-dashboard-with-performance-m.jpg",
    icon: <Users className="w-14 h-14 text-white" />,
    title: "Sales Manager Login",
  },
  "Sales Team Lead": {
    img: "/team-performance-dashboard-with-analytics-and-goal.jpg",
    icon: <BarChart3 className="w-14 h-14 text-white" />,
    title: "Team Lead Login",
  },
  "Sales Representatives": {
    img: "/sales-pipeline-dashboard-with-leads-and-deals.jpg",
    icon: <TrendingUp className="w-14 h-14 text-white" />,
    title: "Sales Representative Login",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const selectedRole = state?.role || "Admin";
  const theme = roleThemes[selectedRole];

  const [waiting, setWaiting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [Password, SetPasswordvisible] = useState(false);

  const TogglePassword = () => {
    SetPasswordvisible(!Password);
  };

  // Handle form field change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setWaiting(true);
    setError("");

    try {
      // console.log("formdatataaaaa",formData," selectedRole==",selectedRole);
      formData.selectedRole = selectedRole;
      const { data } = await api.post("/auth/login", formData);
      setToken(data.token);
      setFormData({ email: "", password: "" });

      // Reinitialize session manager after successful login
      sessionManager.reinitialize();

      navigate(data.user?.defaultPasswordChanged ? "/" : "/change-password");
    } catch (e) {
      const status = e.response?.status;
      if (status === 429) {
        setError(
          "Too many login attempts. Please wait 15 minutes before trying again."
        );
      } else if (status === 401) {
        setError(
          "Invalid email or password. Or not authorized to login as this role"
        );
      } else {
        setError(e.response?.data?.error);
      }
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${theme.img})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md sm:max-w-[500px] lg:max-w-[550px] bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 mx-4 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => navigate("/login/select")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm sm:text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="bg-blue-500 p-4 rounded-2xl shadow-lg flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
            {theme.icon}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {theme.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Enter your credentials to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-base font-medium block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-800" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-base font-medium block mb-2">Password</label>
            <div className="relative">
              {/* Lock Icon */}
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-800" />

              {/* Input Field */}
              <input
                type={Password ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-gray-900 transition-colors"
                required
              />

              {/* Toggle Icon */}
              <button
                type="button"
                onClick={TogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Toggle password visibility"
              >
                {Password ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4" /> Remember me
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() =>
                navigate("/forgot-password", {
                  state: { role: selectedRole, email: formData.email },
                })
              }
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={waiting}
            className={`w-full py-3 rounded-lg text-base font-medium transition-all duration-200 ${
              waiting
                ? "bg-blue-400 cursor-not-allowed text-white"
                : "bg-blue-800 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {waiting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
