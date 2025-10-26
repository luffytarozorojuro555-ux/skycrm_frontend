import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

export default function ChangePassword() {
  const nav = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Redirect to dashboard after short delay
      setTimeout(() => {
        const user = getUserFromToken();
        let path = '/';
        if (user?.roleName === 'Admin') path = '/admin';
        else if (user?.roleName === 'Sales Manager') path = '/manager';
        else if (user?.roleName === 'Sales Team Lead') path = '/teamlead';
        else path = '/rep';
        nav(path, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-80 border">
        <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
        <label className="block mb-2 font-medium">Current Password</label>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
        <label className="block mb-2 font-medium">New Password</label>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <label className="block mb-2 font-medium">Confirm Password</label>
        <input
          type="password"
          className="w-full mb-6 px-3 py-2 border rounded"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg mt-2"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
