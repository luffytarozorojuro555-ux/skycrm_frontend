import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ChangePassword() {
  const nav = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        <div className="mb-4 text-sm text-yellow-800 bg-yellow-100 p-3 rounded border border-yellow-300">
  ⚠️ Password must be at least 8 characters, contain 2 uppercase letters, 3 lowercase letters, 2 numbers, and 1 special character (!@#$&*) and no spaces
</div>
        <label className="block mb-2 font-medium">Current Password</label>
        <div className="relative mb-4">
          <input
            type={showCurrent ? 'text' : 'password'}
            className="w-full px-3 py-2 border rounded pr-10"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
            onClick={() => setShowCurrent(prev => !prev)}
          >
            {showCurrent ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <label className="block mb-2 font-medium">New Password</label>
        <div className="relative mb-4">
          <input
            type={showNew ? 'text' : 'password'}
            className="w-full px-3 py-2 border rounded pr-10"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
            onClick={() => setShowNew(prev => !prev)}
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <label className="block mb-2 font-medium">Confirm Password</label>
        <div className="relative mb-6">
          <input
            type={showConfirm ? 'text' : 'password'}
            className="w-full px-3 py-2 border rounded pr-10"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
            onClick={() => setShowConfirm(prev => !prev)}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
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
