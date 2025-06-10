import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReservationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/account/getReservations/${id}`, { withCredentials: true })
      .then(res => {
        setReservation(res.data);
        return axios.get(`${import.meta.env.VITE_API_URL}/account/getEvents/${res.data.event_id}`, { withCredentials: true });
      })
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return  <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black-500"></div>
        </div>;
  if (!reservation || !event) return <div className="p-4 text-red-500">Erreur lors du chargement de la réservation.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Confirmation de réservation</h2>

      <img src={`${import.meta.env.VITE_API_URL}${event.image_url}`} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />

      <div className="mb-6">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <p className="text-gray-700">{event.description}</p>
        <p className="mt-2"><strong>Adresse :</strong> {event.city} - {event.address}</p>

        {event.is_recurring && event.dates?.length > 0 && (
          <div className="mt-2">
            <strong>Dates :</strong>
            <ul className="list-disc pl-5">
              {event.dates.map((d, idx) => (
                <li key={idx}>{d.date} ({d.start_time} - {d.end_time})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h4 className="font-semibold mb-2">Détails de la réservation</h4>
        <p><strong>ID réservation :</strong> {reservation.id}</p>
        <p><strong>Montant total :</strong> {reservation.total_amount} FCFA</p>
        <p><strong>Méthode de paiement :</strong> {reservation.payment_method}</p>
        <p><strong>Statut du paiement :</strong> {reservation.payment_status}</p>
        <p><strong>Date :</strong> {new Date(reservation.created_at).toLocaleString()}</p>
      </div>

      <div className="text-green-600 font-semibold mb-6">
        ✅ Vous avez reçu votre ticket par email. Merci pour votre réservation.
      </div>

      <button
        onClick={() => navigate('/', { replace: true })}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Retour à l'accueil
      </button>
    </div>
  );
};

export default ReservationDetails;
