import React from 'react';

const ProgressHeader = ({ step, onStepChange, completedSteps = [] }) => {
  const steps = [
    "Informations de l'événement",
    "Tickets",
    "Paiement et Affiche",
    "Résumé"
  ];

  if (step === 5) {
    return (
      <div className="mb-6 text-center">
        <div className="text-green-600 font-bold text-lg">✔️ Événement créé avec succès !</div>
      </div>
    );
  }


  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center">
        {steps.map((label, index) => {
          const stepIndex = index + 1;
          const isActive = step === stepIndex;
          const isCompleted = completedSteps.includes(stepIndex);
          const isAccessible = completedSteps.includes(stepIndex - 1) || stepIndex === 1;

          return (
            <div
              key={index}
              onClick={() => {
                if (isAccessible && onStepChange) {
                  onStepChange(stepIndex);
                }
              }}
              className={`flex-1 flex flex-col items-center text-center cursor-${isAccessible ? "pointer" : "not-allowed"}`}
            >
              <div
                className={`w-8 h-8 mb-1 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-blue-600 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-300 text-gray-600'}
                `}
              >
                {stepIndex}
              </div>
              <span className={`text-xs sm:text-sm ${isActive ? 'text-blue-600 font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ligne de progression */}
      <div className="absolute left-4 right-4 top-4 h-0.5 bg-gray-300 z-0">
        <div
          className="h-0.5 bg-blue-600 transition-all duration-300"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressHeader;

{/*import React from 'react'

const ProgressHeader = ({ step }) => {
  const steps = [
    "Informations de l'événement",
    "Tickets",
    "Paiement et Affiche",
    "Resumé"
  ];

  return (
    <div className="mb-6 flex items-center space-x-4">
      {steps.map((label, index) => (
        <div key={index} className={`flex-1 text-sm ${step - 1 >= index ? "font-bold text-blue-600" : "text-gray-400"}`}>
          {index + 1}. {label}
        </div>
      ))}
    </div>
  );
};


export default ProgressHeader*/}