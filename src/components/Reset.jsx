import React, { useContext, useState } from "react";
import { RecoveryContext } from "../App";
import axios from "axios";

export default function Reset() {
  const { setPage, email, role } = useContext(RecoveryContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function getRoleId(roleName) {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/roles/getRoleId`, {
      params: { name: roleName }
    });
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
      alert("Failed to reset password: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="mb-4 text-xl font-bold text-center">Change Password</h2>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={changePassword}
          className="w-full py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

