import React from "react";

export default function Recovered() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Password successfully set</h2>
        <p className="mb-4">Welcome HOME</p>
        <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
      </div>
    </div>
  );
}
