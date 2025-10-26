import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement backend call for forgot password
    setMsg('If this email exists, a reset link will be sent.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 border">
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password</h2>
        {/* {selectedRole && (
          <div className="text-xs text-gray-600 text-center">Selected role: {selectedRole}</div>
        )} */}
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          className="w-full mb-6 px-3 py-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {msg && <div className="text-green-600 mb-2 text-sm">{msg}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold text-lg mt-2"
        >
          SUBMIT
        </button>
        <button
          type="button"
          className="block mt-4 text-blue-600 hover:underline mx-auto"
          onClick={() => nav('/login/select')}
        >
          Return to Login
        </button>
      </form>
    </div>
  );
}
