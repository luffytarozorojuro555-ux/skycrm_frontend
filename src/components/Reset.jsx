import React, { useContext, useState } from "react";
import { RecoveryContext } from "../App";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Reset() {
  const { setPage, email, role } = useContext(RecoveryContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [newPasswordToggle, setNewPasswordToggle] = useState(false);
  const [confirmPasswordToggle, setConfirmPasswordToggle] = useState(false);

  // Old code commented out for reference
  // async function changePassword() {
  //   if (newPassword !== confirmPassword) {
  //     alert("Passwords do not match");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     await axios.post("http://localhost:8000/api/auth/reset_password", {
  //       email,
  //       role,
  //       newPassword,
  //     });
  //     setPage("recovered");
  //   } catch (err) {
  //     alert("Failed to reset password: " + (err.response?.data?.message || err.message));
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const togglePassword = (name) => {
    if(name==="new"){
      setNewPasswordToggle(!newPasswordToggle);
    }
    else{
      setConfirmPasswordToggle(!confirmPasswordToggle);
    }
  };

  async function getRoleId(roleName) {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/roles/getRoleId`,
      {
        params: { name: roleName },
      }
    );
    return res.data.roleId;
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Get role ObjectId from backend
      const roleId = await getRoleId(role);
      // Send password reset request with role ObjectId
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset_password`, {
        email,
        role: roleId,
        newPassword,
      });
      setPage("recovered");
    } catch (err) {
      console.log(err);
      setErrorMsg("Failed to reset password: " + err.response?.data?.error);
      setTimeout(() => {
        setErrorMsg("");
      }, 10000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="mb-4 text-xl font-bold text-center">Change Password</h2>
        <div className="relative max-w-lg mx-auto">
          <input
            type={newPasswordToggle? "text" : "password"}
            className="w-96 mb-5 px-5 py-2 border rounded"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={()=>togglePassword("new")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle password visibility"
          >
            {newPasswordToggle ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="relative max-w-lg mx-auto">
          <input
            type={confirmPasswordToggle ? "text" : "password"}
            className="w-96 mb-5 px-5 py-2 border rounded"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={()=>togglePassword("confirm")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle password visibility"
          >
            {confirmPasswordToggle ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
        <button
          onClick={changePassword}
          className="w-full py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
      {errorMsg && (
        <p className="text-red-500 bg-red-100 border border-red-300 rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-opacity duration-300">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
