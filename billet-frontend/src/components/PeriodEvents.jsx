import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';

const PeriodEvents = () => {
  const [events, setEvents] = useState([]);
  const [timeFrame, setTimeFrame] = useState('today');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (frame) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/account/events/search?time_frame=${frame}`);
      const data = await res.json();
      setEvents(data);
      
    setTimeout(() => {
      setLoading(false);
    }, 3000);

    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(timeFrame);
  }, [timeFrame]);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-5xl  font-londrina mb-6 text-center">
        {timeFrame === 'today'
          ? "Événements d'aujourd’hui"
          : timeFrame === 'week'
          ? "Événements de la semaine"
          : "Événements du mois"}
      </h1>

      {/* Sélecteur de période stylé */}
      <div className="flex justify-center gap-3 mb-10">
        {[
          { key: 'today', label: "Aujourd’hui" },
          { key: 'week', label: "Cette semaine" },
          { key: 'month', label: "Ce mois" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTimeFrame(key)}
            className={`px-5 py-2 rounded-full font-dmsans text-sm sm:text-base transition-all duration-200 
              ${
                timeFrame === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste des événements */}
      {loading ? (
         <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black-500"></div>
        </div>
      ) : events.length === 0 ? (
          <p className="text-center font-gabarito text-2xl text-gray-600">Aucun événement trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodEvents;
