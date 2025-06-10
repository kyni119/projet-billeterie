import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';
import notfound from '../assets/no-image.jpg'
const EventCard = ({ event }) => {
  const {
    title,
    image_url,
    location_type,
    city,
    tickets,
    start_date,
    dates,
    is_recurring
  } = event;

  const imageUrl = image_url 
    ? `http://localhost:5000${image_url}`
    : notfound;

  const minPrice = tickets?.length > 0
    ? Math.min(...tickets.map(ticket => Number(ticket.price)))
    : null;

  const formatDate = () => {
    if (is_recurring && dates?.length > 0) {
       // Si l'événement est récurrent, afficher "Plusieurs dates"
    return 'Plusieurs dates';
    } else if (start_date) {
      const dateObj = new Date(start_date);
      return dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ' •');
    }
    return 'Date à venir';
  };

  return (
    <Link 
      to={`/event/${event.id}`} 
      className="block rounded-lg overflow-hidden shadow-md transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative w-full h-full"> 
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
    

<div className="absolute bottom-0 left-0 w-full backdrop-blur-md bg-black/40 text-white px-5 py-3">
  <h2 className="text-2xl md:text-[1.75rem] font-bold mb-2 font-gabarito leading-tight line-clamp-2">
    {title}
  </h2>

  {/* Ligne infos */}
  <div className="flex flex-wrap items-center justify-between text-sm font-inter gap-x-4 gap-y-1">
    {/* Lieu */}
    <div className="flex items-center">
      <FaMapMarkerAlt className="mr-1.5 text-red-700 text-lg" />
      {city || (location_type === 'online' ? 'En ligne' : 'Lieu non spécifié')}
    </div>

    {/* Date */}
    <div className="flex items-center">
      <FaCalendarAlt className="mr-1.5 text-blue-300 text-lg" />
      {formatDate()}
    </div>

    {/* Prix */}
    {minPrice && (
      <div className="flex items-center font-medium">
        <FaTicketAlt className="mr-1.5 text-green-400 text-lg" />
        {minPrice.toLocaleString('fr-FR')} FCFA
      </div>
    )}
  </div>
</div>


      </div>
    </Link>
  );
};

export default EventCard;
