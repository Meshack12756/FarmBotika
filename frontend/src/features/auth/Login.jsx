import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStaffLogin =
    new URLSearchParams(location.search).get("role") === "STAFF";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 🔐 Django Auth
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/token/",
        {
          username: identifier,
          password,
        }
      );

      const { access, refresh } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // 🎯 Get Django profile
      const profileRes = await axios.get(
        "http://127.0.0.1:8000/api/auth/profile/",
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      const user = profileRes.data;
      localStorage.setItem("farmerProfile", JSON.stringify(user));

      const username = user.username?.toLowerCase();

      // 🚫 Block staff from generic route
      if (user.role === "STAFF" && !isStaffLogin) {
        setErrorMsg(
          "Staff must use the Staff Login button to access the system."
        );
        return;
      }

      // ✅ Admin route protection
      if (user.role === "ADMIN") {
        if (username === "system.admin@farmbotika.com") {
          navigate("/admin");
        } else {
          setErrorMsg(
            "This admin account is not authorized for dashboard access."
          );
        }
        return;
      }

      // 🔄 Routing fallback
      switch (user.role) {
        case "FARMER":
          navigate("/dashboard");
          break;
        case "STAFF":
          navigate("/staff");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setErrorMsg(
        err.response?.data?.detail ||
          "Login failed. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-white font-poppins px-4">
      <div className="max-w-md w-full mx-auto my-auto p-8 bg-white text-black rounded-xl shadow-xl border border-green-200">
        <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">
          {isStaffLogin ? "Staff Sign In" : "Sign In to FarmBotika"}
        </h2>

        {isStaffLogin && (
          <p className="text-sm text-green-700 text-center mb-4">
            Staff access only. Use your assigned credentials.
          </p>
        )}

        {errorMsg && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4 border border-red-300">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username or Email"
            className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-full px-5 py-3 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-green-700 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className={`w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition duration-300 shadow-md ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
