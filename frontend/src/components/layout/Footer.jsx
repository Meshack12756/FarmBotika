import React from "react";
import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-12 bg-gradient-to-br from-green-800 via-green-900 to-green-950 text-white py-3 px-4 text-sm font-poppins">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lime-300">Contact</h3>
          <p className="flex items-center gap-2">
            <FaEnvelope className="text-lime-300 text-sm" />
            <a
              href="mailto:support@farmbotika.africa"
              className="hover:underline"
            >
              support@farmbotika.africa
            </a>
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-lime-300 text-sm" />
            Nairobi, Kenya
          </p>
        </div>

        {/* Mission Statement */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lime-300">Mission</h3>
          <p className="text-white/80 leading-tight">
            Helping farmers grow smarter with digital tools that improve
            productivity and resilience.
          </p>
        </div>

        {/* Brand Note */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lime-300">FarmBotika</h3>
          <p className="text-white/80 leading-tight">
            Inclusive tech, seasonal planning, and meaningful impact—one harvest
            at a time.
          </p>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} FarmBotika. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
