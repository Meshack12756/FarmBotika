import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  HomeIcon,
  CloudIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Squares2X2Icon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/solid";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    const getUserDetails = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { full_name } = user.user_metadata || {};
        setUserInfo({
          name: full_name || "Farmer",
          email: user.email || "",
        });
      }
    };
    getUserDetails();
  }, []);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    if (!refreshToken || !accessToken) {
      console.warn("Missing token(s) during logout.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("farmerProfile");
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData?.detail || "Unknown error");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="w-70 bg-green-100 border-r border-green-300 text-green-900 p-6 min-h-screen font-poppins flex flex-col shadow-lg">
      {/* Navigation Section */}
      <div className="space-y-6">
        <nav className="space-y-5 text-sm">
          <button
            onClick={() => navigate("/dashboard/overview")}
            className="flex items-center gap-3 hover:text-green-700 transition"
          >
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => navigate("/dashboard/crop-advisor")}
            className="flex items-center gap-3 hover:text-green-700 transition"
          >
            <PresentationChartBarIcon className="w-5 h-5" />
            Crop Advisor
          </button>
          <button
            onClick={() => navigate("/dashboard/weather")}
            className="flex items-center gap-3 hover:text-green-700 transition"
          >
            <CloudIcon className="w-5 h-5" />
            Weather Forecast
          </button>
          <button
            onClick={() => navigate("/dashboard/yield-history")}
            className="flex items-center gap-3 hover:text-green-700 transition"
          >
            <ChartBarIcon className="w-5 h-5" />
            Yield History
          </button>
          <button
            onClick={() => navigate("/dashboard/sensor-data")}
            className="flex items-center gap-3 hover:text-green-700 transition"
          >
            <Squares2X2Icon className="w-5 h-5" />
            Pest and disease
          </button>
        </nav>
      </div>

      <div className="mt-auto mb-16 pt-6 text-sm border-t border-green-300">
        {/* Profile */}
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-3 mb-4 w-full text-left hover:bg-green-50 px-2 py-2 rounded transition"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-green-200 rounded-full text-green-800">
            {userInfo.name ? (
              <UserCircleIcon className="w-8 h-8" />
            ) : (
              <span className="font-bold text-sm">
                {getInitials(userInfo.name || "F")}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-green-900">{userInfo.name}</p>
            <p className="text-xs text-green-600 truncate">{userInfo.email}</p>
          </div>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center w-full gap-3 px-3 py-2 text-green-800 hover:text-green-700 hover:bg-green-50 rounded transition text-sm"
        >
          <CogIcon className="w-5 h-5" />
          Settings
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition text-sm"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
