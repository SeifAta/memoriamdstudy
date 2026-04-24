// Login.tsx
import React, { useState } from "react";

type LoginProps = {
  onLogin: (username: string, password?: string, anonymous?: boolean) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username) {
      setError("Please enter your name :)");
      return;
    }
    setError("");
    onLogin(username, password);
  };

  const handleAnonymous = () => {
    onLogin("Anonymous", undefined, true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1117] text-white">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Welcome to MemoriaMD</h2>

        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="What's your name? :)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFC6]"
          />
          <input
            type="password"
            placeholder="Password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFC6]"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] rounded-lg text-white font-medium hover:scale-105 transition"
        >
          Continue
        </button>

        <button
          onClick={handleAnonymous}
          className="w-full py-3 border-2 border-[#00FFC6] rounded-lg text-[#00FFC6] font-medium hover:bg-[#00FFC620] transition"
        >
          Continue as Anonymous
        </button>
      </div>
    </div>
  );
}
