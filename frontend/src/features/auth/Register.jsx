import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        {
          username,
          full_name: fullName,
          email,
          password,
          phone,
          role: "FARMER",
        }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("✅ Registration success:", response.data);
        navigate("/onboarding"); // ✅ redirect to profile form
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          "Registration failed. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-white font-poppins px-4">
      <div className="max-w-xl w-full mx-auto my-auto p-8 bg-white text-black rounded-xl shadow-xl border border-green-200">
        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
          Create Your Account
        </h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4 border border-red-300">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Role is now fixed and hidden */}
          <input type="hidden" value="FARMER" />

          <input
            type="password"
            placeholder="Create Password"
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
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
