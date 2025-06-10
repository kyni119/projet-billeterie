import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { SiAppstore, SiGoogleplay } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0">

        {/* Logo & text */}
        <div className="text-center md:text-left">
          <h1 className="text-7xl font-londrina tracking-wide mb-2">Ticky</h1>
          <p className="text-sm text-gray-400">Simplifiez la gestion de vos événements.</p>
        </div>

        {/* Social links */}
        <div className="flex items-center space-x-5">
          <FaInstagram className="text-white text-xl hover:text-gray-400 transition" />
          <FaTwitter className="text-white text-xl hover:text-gray-400 transition" />
          <FaFacebookF className="text-white text-xl hover:text-gray-400 transition" />
        </div>

        {/* App buttons */}
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:scale-105 transition">
            <SiAppstore className="text-xl" />
            <span className="text-sm font-medium">App Store</span>
          </div>
          <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:scale-105 transition">
            <SiGoogleplay className="text-xl" />
            <span className="text-sm font-medium">Play Store</span>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        © Ticky 2025. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
