import React from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../common/LanguageSelector";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-br from-lime-200 via-green-200 to-green-300 text-green-900 shadow-sm">
      <div className="w-full flex items-center justify-between px-0 py-4">
        {/* Left Edge Brand */}
        <div className="pl-6">
          <h1 className="text-xl font-bold font-poppins text-green-800 tracking-wide">
            FarmBotika
          </h1>
        </div>

        {/* Right Edge Controls */}
        <div className="pr-6 flex items-center gap-4">
          <LanguageSelector />

          {/* Staff Login Button */}
          <button
            onClick={() => navigate("/login?role=STAFF")}
            className="px-4 py-2 text-sm border border-green-700 text-green-700 rounded-full hover:bg-green-100 transition duration-300 font-medium shadow-sm"
          >
            Staff Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
