import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Favorites = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/account/getFavorites?userId=${userId}`);
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mes favoris</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.length === 0 ? (
            <p>Aucun événement favori pour le moment.</p>
          ) : (
            favorites.map(event => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="block bg-white rounded shadow hover:shadow-lg transition"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${event.image_url}`}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t"
                />
                <div className="p-3">
                  <h2 className="font-semibold text-lg">{event.title}</h2>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
