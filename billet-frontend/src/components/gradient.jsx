import React from 'react';

const GradientBackground = ({ children }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-[#0D1B2A] via-[#1E2A47] to-[#0D1B2A]" />
      <div className="relative z-10">
        {children}
      </div>

      <style>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default GradientBackground;
