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
    ? `${import.meta.env.VITE_API_URL}${image_url}`
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
      className="group relative block aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dégradé pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      {/* Badge prix */}
      {minPrice !== null && minPrice > 0 && (
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-ink shadow font-inter">
          <FaTicketAlt className="text-accent" />
          dès {minPrice.toLocaleString('fr-FR')} FCFA
        </span>
      )}
      {minPrice === 0 && (
        <span className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white shadow font-inter">
          Gratuit
        </span>
      )}

      <div className="absolute bottom-0 left-0 w-full p-5 text-white">
        <h2 className="mb-3 line-clamp-2 font-gabarito text-2xl font-bold leading-tight">
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-inter text-sm text-white/90">
          <span className="flex items-center">
            <FaMapMarkerAlt className="mr-1.5 text-accent" />
            {city || (location_type === 'online' ? 'En ligne' : 'Lieu non spécifié')}
          </span>
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1.5 text-sky-300" />
            {formatDate()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
