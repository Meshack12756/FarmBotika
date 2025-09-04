import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Language resources
const resources = {
  en: {
    translation: {
      welcome: "Welcome to FarmBotika",
      description: "Empowering farmers with technology for better yields.",
      login: "Login",
      register: "Register",
      addTask: "Add Task",
      fullName: "Full Name",
      region: "Region",
      language: "Language",
      yourCrops: "Your Crops",
      saveProfile: "Save Profile",
      plantingWindow: "Planting Window",
      harvestWindow: "Harvest Window",
      // Add more translations as needed
    },
  },
  sw: {
    translation: {
      welcome: "Karibu FarmBotika",
      description: "Kuimarisha wakulima kwa teknolojia bora ya mazao.",
      login: "Ingia",
      register: "Jisajili",
      addTask: "Ongeza Jukumu",
      fullName: "Jina Kamili",
      region: "Eneo",
      language: "Lugha",
      yourCrops: "Mazao Yako",
      saveProfile: "Hifadhi Taarifa",
      plantingWindow: "Muda wa Kupanda",
      harvestWindow: "Muda wa Kuvuna",
      // Add more translations as needed
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
