import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/password-reset/",
        {
          email,
        }
      );

      if (response.status === 200 || response.status === 202) {
        setSubmitted(true);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("❌ Password reset error:", err);
      setErrorMsg(
        err.response?.data?.detail ||
          "Something went wrong. Please check your email and try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-white font-poppins px-4">
      <div className="max-w-md w-full mx-auto my-auto p-8 bg-white text-black rounded-xl shadow-xl border border-green-200">
        <h2 className="text-3xl font-bold text-green-800 mb-4 text-center">
          Forgot Password
        </h2>

        {submitted ? (
          <p className="text-green-700 text-center">
            A password reset link has been sent to your email. Please check your
            inbox.
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4 border border-red-300">
                {errorMsg}
              </div>
            )}
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition duration-300 shadow-md"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
