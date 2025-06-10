import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import dayjs from 'dayjs';  // Assurez-vous que dayjs est importé

const EventSolo = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/account/getEvents/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error('Erreur chargement événement :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="p-8 text-center">Événement introuvable</div>;
  }

  const renderEventDates = () => {
    if (event.is_recurring) {
      return (
        <div>
          <strong>Dates :</strong>
           <ul className="list-disc list-inside">
                    {event.dates.map((d, i) => (
                      <li key={i}>
                        {d.date} de {d.start_time.slice(0, 5)} à {d.end_time.slice(0, 5)}
                      </li>
                    ))}
                  </ul>
        </div>
      );
    } else {
      return (
        <div>
          <strong>Date :</strong>
          <p>
            {dayjs(event.start_date).format('DD MMM YYYY')} de {dayjs(event.start_date).format('HH:mm')} à {dayjs(event.end_date).format('HH:mm')}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-6 flex-grow">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">Accueil</Link> {' > '}
          <Link to="/search?category_id=-1" className="hover:underline">Événements</Link> {' > '}
          <span className="text-black font-semibold">{event.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="lg:w-1/2">
            <img
              src={`${import.meta.env.VITE_API_URL}${event.image_url}`}
              alt={event.title}
              className="w-full h-auto rounded-xl object-cover shadow-md"
            />
          </div>

          {/* Infos événement */}
          <div className="lg:w-1/2 space-y-4">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <div className="text-gray-700 whitespace-pre-wrap">
              {event.description}
            </div>

            {/*<p className="text-gray-700">{event.description}</p>*/}
            <div className="text-sm text-gray-600">
              <p><strong>Type :</strong> {event.location_type === 'offline' ? 'En présentiel' : 'En ligne'}</p>
              <p><strong>Lieu :</strong> {event.address}, {event.city}</p>
              
              {renderEventDates()}  {/* Afficher les dates selon le type d'événement */}

              <p><strong>Téléphone :</strong> {event.phone}</p>
              {event.website_url && (
                <p>
                  <strong>Site Web :</strong>{' '}
                  <a href={event.website_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {event.website_url}
                  </a>
                </p>
              )}
            </div>

            <div className="mt-6">
              {[-1, -2, 1].includes(event.status) ? (
                <button
                  disabled
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded font-semibold cursor-not-allowed"
                >
                  Guichet fermé
                </button>
              ) : (
                <Link to={`/event/${event.id}/reservation`}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold transition">
                    Réserver
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventSolo;
