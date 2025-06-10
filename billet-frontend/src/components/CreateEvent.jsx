import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="bg-gray-700 text-white py-20 px-6 animate-fade-in">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-anton mb-6 tracking-tight">
          Créez votre événement
        </h2>

        <p className="text-lg sm:text-xl font-dmsans text-gray-300 leading-relaxed max-w-2xl mx-auto">
          Ticky vous donne les outils pour créer, vendre et gérer vos événements
          en toute autonomie — <span className="text-white font-medium">en quelques clics seulement</span>.
        </p>

        <button
          onClick={handleClick}
          className="mt-10 inline-block bg-white text-black px-8 py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 active:scale-95"
        >
          Lancer un événement
        </button>

        <p className="mt-8  text-md font-poppins uppercase tracking-wider">
          Accessible 24h/24, 7j/7. Gratuit. Simple. Puissant.
        </p>
      </div>
    </section>
  );
};

export default CreateEvent;
