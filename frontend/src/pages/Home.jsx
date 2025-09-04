import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChatBot from "../features/ai-assistant/ChatBot";
import Footer from "../components/layout/Footer";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-lime-100 via-green-100 to-white font-poppins overflow-y-auto">
      {/* Main Content */}
      <main className="flex flex-col items-center px-6 py-16 gap-16">
        <div className="max-w-2xl flex flex-col items-center gap-6">
          <h2 className="text-4xl md:text-5xl font-mogra text-green-700 drop-shadow-sm">
            {t("welcome", "Welcome to FarmBotika")}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            {t(
              "description",
              "Empowering farmers with technology for better yields and climate resilience."
            )}
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition duration-300 shadow-md"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition duration-300 shadow-md"
            >
              Register
            </button>
          </div>
        </div>

        {/* ChatBot Assistant */}
        <div className="w-full max-w-lg">
          <ChatBot />
        </div>
      </main>

      {/* Footer visible only on Home */}
      <Footer />
    </div>
  );
};

export default Home;