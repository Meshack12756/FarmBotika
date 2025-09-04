import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <select
      className="bg-green-100 text-green-900 border border-green-300 px-3 py-2 rounded-full text-sm font-poppins shadow-sm hover:shadow-md focus:outline-none transition duration-300"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="sw">Swahili</option>
    </select>
  );
};

export default LanguageSelector;
