import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message, Spin, Button, Divider } from 'antd';
import { LoadingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import LoginRegisterModal from './LoginRegisterModal';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
// Import des images des méthodes de paiement
import visaImg from '../../assets/visa.png';
import mastercardImg from '../../assets/mastercard.png';
import mtnImg from '../../assets/mtn.png';
import orangeImg from '../../assets/orange.png';
import waveImg from '../../assets/wave.png';
import djamoImg from '../../assets/djamoapp_logo.jpeg';

const paymentMethods = [
  { id: 'visa', name: 'Visa', image: visaImg },
  { id: 'mastercard', name: 'MasterCard', image: mastercardImg },
  { id: 'mtn', name: 'MTN Mobile Money', image: mtnImg },
  { id: 'orange', name: 'Orange Money', image: orangeImg },
  { id: 'wave', name: 'Wave', image: waveImg },
  { id: 'djamo', name: 'Djamo', image: djamoImg },
];

const TicketReservation = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('visa');

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/account/getEvents/${id}`, { withCredentials: true })
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleQuantityChange = (ticketId, newQuantity) => {
    const ticket = event.tickets.find(t => t.id === ticketId);
    const quantity = Math.max(0, Math.min(newQuantity, ticket.available));
    setQuantities(prev => ({ ...prev, [ticketId]: quantity }));
  };

  const incrementQuantity = (ticketId) => {
    const current = quantities[ticketId] || 0;
    handleQuantityChange(ticketId, current + 1);
  };

  const decrementQuantity = (ticketId) => {
    const current = quantities[ticketId] || 0;
    handleQuantityChange(ticketId, current - 1);
  };

  const getTotal = () => {
    if (!event) return 0;
    return event.tickets.reduce((sum, ticket) => {
      const qty = quantities[ticket.id] || 0;
      return sum + (ticket.price * qty);
    }, 0);
  };

  const handleReserve = async () => {
    const selectedTickets = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, qty]) => ({
        ticket_id: parseInt(ticketId),
        quantity: qty,
      }));

    if (selectedTickets.length === 0) {
      message.warning("Veuillez sélectionner au moins un ticket");
      return;
    }

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setReserving(true);
    
    try {
      const payload = {
        event_id: parseInt(id),
        payment_method: paymentMethod,
        tickets: selectedTickets,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/pay/reservations`, payload, {
        withCredentials: true
      });
      
      message.success("Réservation réussie !");
      const reservationId = res.data.reservation.id;
      navigate(`/reservation/${reservationId}`, { replace: true });
    } catch (err) {
      message.error("Erreur lors de la réservation : " + (err.response?.data?.message || err.message));
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">

          <div className="animate-spin rounded-full h-15 w-15 top-80 border-t-2 border-b-2 border-black-500"></div>
   
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Événement non trouvé</p>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold  font-gabarito text-center text-gray-900 mb-8">{event.title}</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Tickets Selection */}
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Billets disponibles</h2>
            <Divider className="my-4" />
            
            <div className="space-y-6">
              {event.tickets.map(ticket => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold  font-inter text-lg">{ticket.type}</h3>
                      <p className="text-gray-600 font-dmsans mt-1">{ticket.advantages}</p>
                      <p className="text-blue-600 font-medium font-inter mt-2">{ticket.price} FCFA</p>
                      <p className="text-sm text-gray-500 mt-1">{ticket.available} places disponibles</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decrementQuantity(ticket.id)}
                        disabled={(quantities[ticket.id] || 0) <= 0}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusOutlined />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={ticket.available}
                        value={quantities[ticket.id] || 0}
                        onChange={(e) => handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)}
                        className="border rounded-lg px-3 py-1 w-16 text-center  focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => incrementQuantity(ticket.id)}
                        disabled={(quantities[ticket.id] || 0) >= ticket.available}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
            <Divider className="my-4" />
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800">Détails de la commande</h3>
                <Divider className="my-3" />
                
                {event.tickets.map(ticket => {
                  const qty = quantities[ticket.id] || 0;
                  if (qty === 0) return null;
                  return (
                    <div key={ticket.id} className="flex justify-between py-2">
                      <span>{ticket.type} × {qty}</span>
                      <span>{ticket.price * qty} FCFA</span>
                    </div>
                  );
                })}
                
                <Divider className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{getTotal()} FCFA</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Méthode de paiement</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 border rounded-lg flex flex-col items-center transition-all ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <img src={method.image} alt={method.name} className="h-10 mb-2 object-contain" />
                      <span className="text-sm">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleReserve}
                loading={reserving}
                className="mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {reserving ? 'Traitement en cours...' : 'Confirmer et payer'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginRegisterModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={() => {
            setShowLoginModal(false);
          }} 
        />
      )}
    </div>
    <Footer/>
    </>
  );
};

export default TicketReservation;/*import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { useAuth } from '../../context/AuthContext';  
import LoginRegisterModal from './LoginRegisterModal'; // Crée ce composant à part

const TicketReservation = () => {
  const { id } = useParams();
  const {user} = useAuth(); 
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userConnected, setUserConnected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('visa');


  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/account/getEvents/${id}`, { withCredentials: true })
      .then(res => setEvent(res.data))
      .catch(err => console.error(err));

      if(user && user?.id){
        setUserConnected(true)
      }
      else{
        setUserConnected(false)
      }
  }, [id,user]);

  const handleQuantityChange = (ticketId, quantity) => {
    setQuantities(prev => ({ ...prev, [ticketId]: Number(quantity) }));
  };

  const getTotal = () => {
    return event.tickets.reduce((sum, ticket) => {
      const qty = quantities[ticket.id] || 0;
      return sum + (ticket.price * qty);
    }, 0);
  };

  const handleReserve = () => {
    const selectedTickets = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, qty]) => ({
        ticket_id: parseInt(ticketId),
        quantity: qty,
      }));

    if (selectedTickets.length === 0) return alert("Sélectionne au moins un ticket.");

    if (!userConnected) {
      setShowLoginModal(true);
      return;
    }

    const payload = {
      event_id: parseInt(id),
      payment_method:  paymentMethod,
      tickets: selectedTickets,
    };

    axios.post(`${import.meta.env.VITE_API_URL}/pay/reservations`, payload, {
  withCredentials: true
}).then(res => {
  message.success("Réservation réussie !");
  const reservationId = res.data.reservation.id;
  navigate(`/reservation/${reservationId}`, { replace: true });
}).catch(err => {
  message.error("Erreur réservation : " + (err.response?.data?.message || err.message));
});

  };

  if (!event) return <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-15 w-15 top-80 border-t-2 border-b-2 border-black-500"></div>
        </div>;

  return (   
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{event.title} - Réservation</h2>

      {event.tickets.map(ticket => (
        <div key={ticket.id} className="flex items-center justify-between border-b py-3">
          <div>
            <div className="font-semibold">{ticket.type}</div>
            <div className="text-sm text-gray-600">{ticket.advantages}</div>
            <div className="text-sm">Prix : {ticket.price} FCFA</div>
          </div>
          <input
            type="number"
            min={0}
            max={ticket.available}
            value={quantities[ticket.id] || 0}
            onChange={(e) => handleQuantityChange(ticket.id, e.target.value)}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
      ))}


      <div className="mt-6 font-bold text-lg">Total : {getTotal()} FCFA</div>


      <label>
        Méthode de paiement:
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="visa">Visa</option>
          <option value="mastercard">MasterCard</option>
          <option value="mtn">MTN</option>
          <option value="orange">Orange</option>
          <option value="wave">Wave</option>
          <option value="djamo">Djamo</option>
        </select>
      </label>

      <button
        onClick={handleReserve}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Réserver et payer
      </button>

      {showLoginModal && (
        <LoginRegisterModal onClose={() => setShowLoginModal(false)} onSuccess={() => {
          setUserConnected(true);
          setShowLoginModal(false);
        }} />
      )}
    </div>
  );
};

export default TicketReservation;
*/