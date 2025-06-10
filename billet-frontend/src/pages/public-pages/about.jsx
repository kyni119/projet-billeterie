import React from 'react';

const About = () => {
  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-anton mb-6 tracking-tight">
          TICKY, la billetterie réinventée
        </h2>
        <p className="text-lg sm:text-xl font-dmsans text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Ticky est une plateforme pensée pour les créateurs d’expériences. Que vous organisiez un concert, une conférence, ou un festival,
          notre technologie vous aide à vendre vos billets en toute simplicité — <span className="text-white font-medium">24h/24, 7j/7</span>.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-300 font-inter text-sm sm:text-base">
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Simplicité</h3>
            <p>Lancez un événement en quelques clics. Ticky vous accompagne à chaque étape.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Fiabilité</h3>
            <p>Des serveurs sécurisés, des paiements stables et une gestion sans stress.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Expérience</h3>
            <p>Offrez à vos participants une interface fluide, rapide, et agréable — sur tous les écrans.</p>
          </div>
        </div>

        <p className="mt-12 text-gray-400 text-md font-poppins tracking-wide uppercase">
          Designé avec ❤️ pour les organisateurs d’événements et les clients
        </p>
      </div>
    </section>
  );
};

export default About;
