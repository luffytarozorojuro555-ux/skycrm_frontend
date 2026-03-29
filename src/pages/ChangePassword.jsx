import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { X } from 'lucide-react';

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

  const handleClose = () => {
    const user = getUserFromToken();
    let path = '/';
    if (user?.roleName === 'Admin') path = '/admin';
    else if (user?.roleName === 'Sales Manager') path = '/manager';
    else if (user?.roleName === 'Sales Team Lead') path = '/teamlead';
    else path = '/rep';
    nav(path, { replace: true });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg max-w-xl w-full mx-4 border">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Change Password</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close"
          >
            <X size={24} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        <div className="mb-6 text-sm text-yellow-800 bg-yellow-100 p-4 rounded border border-yellow-300">
  ⚠️ Password must be at least 8 characters, contain 2 uppercase letters, 3 lowercase letters, 2 numbers, and 1 special character (!@#$&*) and no spaces
</div>
        <label className="block mb-3 font-medium text-gray-700">Current Password</label>
        <div className="relative mb-6">
          <input
            type={showCurrent ? 'text' : 'password'}
            className="w-full px-4 py-3 border rounded pr-12"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => setShowCurrent(prev => !prev)}
          >
            {showCurrent ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <label className="block mb-3 font-medium text-gray-700">New Password</label>
        <div className="relative mb-6">
          <input
            type={showNew ? 'text' : 'password'}
            className="w-full px-4 py-3 border rounded pr-12"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => setShowNew(prev => !prev)}
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <label className="block mb-3 font-medium text-gray-700">Confirm Password</label>
        <div className="relative mb-8">
          <input
            type={showConfirm ? 'text' : 'password'}
            className="w-full px-4 py-3 border rounded pr-12"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => setShowConfirm(prev => !prev)}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        {error && <div className="text-red-600 mb-4 text-sm bg-red-50 p-3 rounded border border-red-200">{error}</div>}
        {success && <div className="text-green-600 mb-4 text-sm bg-green-50 p-3 rounded border border-green-200">{success}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg transition-colors duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
