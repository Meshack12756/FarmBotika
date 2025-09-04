import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token"); // from email link
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/password-reset/confirm/",
        { token, password }
      );

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2500);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("❌ Reset error:", err);
      setErrorMsg(
        err.response?.data?.detail ||
        "Reset failed. Please try again or request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-white font-poppins px-4">
      <div className="max-w-md w-full mx-auto my-auto p-8 bg-white text-black rounded-xl shadow-xl border border-green-200">
        <h2 className="text-3xl font-bold text-green-800 mb-4 text-center">
          🔐 Reset Your Password
        </h2>

        {success ? (
          <p className="text-green-700 text-center">
            ✅ Password updated! Redirecting to login...
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleReset}>
            {errorMsg && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4 border border-red-300">
                {errorMsg}
              </div>
            )}
            <input
              type="password"
              placeholder="New Password"
              className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className={`w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition duration-300 shadow-md ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;