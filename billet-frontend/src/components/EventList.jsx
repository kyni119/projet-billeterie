import React, { useEffect, useState } from 'react';
import EventCard from './EventCard';
import EventCardSkeleton from './contentLoader';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // Démarre le chargement
    setIsLoading(true);
    
    fetch(`${import.meta.env.VITE_API_URL}/account/getUpcomingEvents`)  
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => console.error('Erreur:', error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="event-list w-full ">
      <h1 className="text-5xl  text-center font-londrina font-bold mb-8">Tous les événements</h1>

      {isLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-center font-gabarito text-2xl text-gray-600">Aucun événement trouvé.</p>
      )}
    </div>
  );
};

export default EventList;
