import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';  
import { Link } from 'react-router-dom';
import './favorite.css';
import axios from 'axios';
import { message ,  Spin } from 'antd';
import dayjs from 'dayjs';
import { encryptData } from '../../components/CreateEvent/util';
import { decryptData } from '../../components/CreateEvent/util';
import EventDetails from "../../components/CreateEvent/Step1EventDetails";
import Tickets from "../../components/CreateEvent/Step2Tickets";
import  PaymentImage from "../../components/CreateEvent/Step4PaymentMethod";
import Resume from "../../components/CreateEvent/Step3Resume";
import ProgressHeader from "../../components/CreateEvent/ProgressHeader";

import HeaderCopy from '../../components/HeaderCopy';
import { FiX } from 'react-icons/fi';
import { FiMenu } from 'react-icons/fi';
import { 
  FiHome, 
  FiUser, 
  FiCalendar, 
  FiHeart, 
  FiPlusCircle, 
  FiList, 
  FiLock, 
  FiLogOut 
} from 'react-icons/fi';
import { CgUser } from 'react-icons/cg';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('profile'); 
      const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

   // Vérifie la taille de l'écran au chargement et au redimensionnement
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  const [eventData, setEventData] = useState(() => {
  const saved = localStorage.getItem('eventData');

    return saved ? decryptData(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('eventData', encryptData(eventData));
  }, [eventData]);

  useEffect(() => {
    if (activeMenu !== "createEvent") {
      setEventData({});
      localStorage.removeItem("eventImage");
      localStorage.removeItem("eventData");
    }
  }, [activeMenu]);


  // Fonction pour charger la vue en fonction du menu sélectionné
  const loadSection = () => {
    switch (activeMenu) {
      case 'profile':
        return <Profile user={user} />;
      case 'informations':
        return <Informations user={user} />;
      case 'reservations':
        return <Reservations userId={user?.id} />;
      case 'favorites':
        return <Favorites userId={user?.id} />;
      case 'createEvent':
        return  <CreateEvent
            eventData={eventData}
            setEventData={setEventData}
          />;
      case 'security':
        return <SecuritySettings />;
      case 'myEvents':
        return <MyEvents userId={user?.id} />;
      default:
        return <Profile user={user} />;
    }
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };



  return (
    <>
    <HeaderCopy/>
      <div className="flex">
      {/* Bouton toggle pour mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-black text-white p-2 rounded-lg"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-black text-white w-64 min-h-screen  fixed md:static z-40 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'left-0' : '-left-64'} top-0 border-r border-gray-700`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Profil */}
          <div className="profile-section text-center mb-8">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="rounded-full w-20 h-20 mx-auto object-cover border-2 border-white"
              />
            ) : (
              <div className="rounded-full w-20 h-20 mx-auto bg-gray-700 flex items-center justify-center border-2 border-white">
                <CgUser className="text-3xl text-white" />
              </div>
            )}
            <h2 className="mt-4 font-medium text-lg">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {user?.profile === 1 ? 'Organisateur' : 'Utilisateur'}
            </p>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {[
                { id: 'profile', label: 'Tableau de bord' },
                { id: 'informations', label: 'Mes Informations' },
                { id: 'reservations', label: 'Mes réservations' },
                { id: 'favorites', label: 'Mes favoris' },
                ...(user?.profile === 1 ? [
                  { id: 'createEvent', label: 'Créer un événement' },
                  { id: 'myEvents', label: 'Mes événements' },
                ] : []),
                { id: 'security', label: 'Sécurité' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeMenu === item.id 
                        ? 'bg-white text-black font-medium' 
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="mt-auto pt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
        <div className="p-6">
          {loadSection()}
        </div>
      </div>
    </div>


  
  
    </>
  );
};


const Profile = ({ user }) => (
  <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
    <div className="flex flex-col md:flex-row gap-8">
      {/* Section Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-full w-32 h-32 object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="rounded-full w-32 h-32 bg-gray-200 flex items-center justify-center border-4 border-gray-300">
              <CgUser className="text-5xl text-gray-500" />
            </div>
          )}
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Changer la photo
        </button>
      </div>

      {/* Section Informations */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Profil</h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h2>
            <p className="text-lg font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Email</h2>
            <p className="text-lg">{user?.email}</p>
          </div>

          {user?.phoneNumber && (
            <div className="border-b pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h2>
              <p className="text-lg">{user?.phoneNumber}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Statut</h2>
            <p className="text-lg">
              {user?.profile === 1 ? 'Organisateur' : 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);


const Informations = () => {
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/account/getProfile`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setOriginalData(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
          });
        }
      } catch (err) {
        console.error('Erreur chargement profil', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,}$/;

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Email invalide';
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Minimum 8 chiffres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/account/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Profil mis à jour avec succès' });
        setOriginalData(formData);
        setIsEditing(false);
      } else {
        setStatus({ type: 'error', message: data?.message || 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur serveur' });
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    setIsEditing(false);
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Informations</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Modifier
          </button>
        )}
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-md ${
          status.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.firstName 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${!isEditing ? 'bg-gray-100' : ''}`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.lastName 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${!isEditing ? 'bg-gray-100' : ''}`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.email 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${!isEditing ? 'bg-gray-100' : ''}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.phoneNumber 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${!isEditing ? 'bg-gray-100' : ''}`}
              placeholder="Facultatif"
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
          </div>

          {/* Boutons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Enregistrer
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

const Reservations = ({ userId }) => (
  <div>
    <h1 className="text-2xl font-bold">Mes réservations</h1>

  </div>
);

const Favorites = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [removingIds, setRemovingIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/account/getFavorites?userId=${userId}`, {
          credentials: 'include',
        });
        const data = await response.json();
        setFavorites(Array.isArray(data) ? data : data.favorites || []);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (eventId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/account/putFavorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ event_id: eventId }),
      });

      const data = await res.json();

      if (data.success && !data.isFavorite) {
        // Lance animation avant suppression
        setRemovingIds(prev => [...prev, eventId]);
        setTimeout(() => {
          setFavorites(prev => prev.filter(event => event.id !== eventId));
          setRemovingIds(prev => prev.filter(id => id !== eventId));
        }, 300); // Match la durée de l'anim CSS
      }
    } catch (err) {
      console.error('Erreur lors du toggle favori:', err);
    }
  };

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
            favorites.map(event => {
              const isRemoving = removingIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  className={`relative group transition-transform duration-300 ${
                    isRemoving ? 'fade-out' : ''
                  }`}
                >
                  <Link
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

              
                  <button
                    onClick={() => toggleFavorite(event.id)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:scale-110 transition z-10 heart-btn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="red"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-6 h-6 animate-pulse-once"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.24 3 12 4.5 12 4.5C12 4.5 12.76 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z"
                      />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const CreateEvent = ({ eventData, setEventData }) => {

  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

// Exemple après avoir validé l'étape 1 :

const handleNextStep = () => {
  const nextStep = step + 1;
  setStep(nextStep);
  setMaxStepReached(prev => Math.max(prev, nextStep));
};

  const goBack = () => setStep(step - 1);

const handlePublish = async () => {

  console.log("les eventdant", eventData);
  const payload = {
    ...eventData,
    tickets:undefined,
    payment: undefined,
    imageFile: undefined,
  };

  // 1. Créer l’événement
  
  const res1 = await fetch(`${import.meta.env.VITE_API_URL}/account/create-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // cookies
    body: JSON.stringify(payload),
  });

  console.log("Le payload", payload);

  const result1 = await res1.json();
  console.log('📤 Étape 1 - Résultat création événement:', result1);

  if (!result1.success) {
    message.error('Erreur lors de la création de l’événement');
    return;
  }

  const eventId = result1.eventId;

  //2ajiur des billets
  if (Array.isArray(eventData.tickets) && eventData.tickets.length > 0) {
  for (const ticket of eventData.tickets) {
  const resTicket = await fetch(`${import.meta.env.VITE_API_URL}/account/${eventId}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
    credentials: 'include', // si besoin d’envoyer les cookies
  });

  const ticketResult = await resTicket.json();
  console.log(" Résultat ticket individuel :", ticketResult);

  if (!ticketResult.success) {
    throw new Error(ticketResult.message || "Échec de l'ajout d’un ticket");
  }
}
  }

  const resPayment = await fetch(`${import.meta.env.VITE_API_URL}/account/${eventId}/payment-methods`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData.payment),
  credentials: 'include', // si besoin de cookies
  });

  const result3 = await resPayment.json();
  console.log(' Étape 3 - Résultat paiement:', result3);

  if (!result3.success) {
    message.error("Erreur lors de l’ajout de la méthode de paiement");
    return;
  }

  // 4. Uploader l’image
  const formData = new FormData();
  formData.append('image', eventData.imageFile);


  const res4 = await fetch(`${import.meta.env.VITE_API_URL}/account/add-image/${eventId}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const result4 = await res4.json();
  console.log('Étape 4 - Résultat image:', result4);

  if (!result4.success) {
    message.error("Erreur lors de l’upload de l’image");
    return;
  }
  message.success('Image uploadée avec succès');

  // Finalisation
  localStorage.removeItem('eventData');
   localStorage.removeItem('eventImage');
  message.success('🎉 Événement publié avec succès');
       setStep(5);
};


  return (
    <div className="p-4">
        <h1 className="text-2xl font-bold">Créer un événement</h1>

        
      <ProgressHeader
  step={step}
  onStepChange={(targetStep) => {
    if (targetStep <= maxStepReached) {
      setStep(targetStep);
    }
  }}
  completedSteps={[1, 2, 3, 4].filter(i => i <= maxStepReached)}  // Ajuste `maxStepReached` dynamiquement
/>




      {step === 1 && (
  <EventDetails
    initialData={eventData}
    onNext={(data) => {
      setEventData(prev => ({ ...prev, ...data }));
      handleNextStep();
    }}
  />
)}
    {step === 2 && (
        <Tickets
          initialTickets={eventData.tickets || []}
          onNext={(tickets) => {
            setEventData(prev => ({ ...prev, tickets }));
            handleNextStep();
          }}
          onBack={goBack}
        />
    )}
    {step === 3 && (
  <PaymentImage
    initialData={eventData}
    onBack={goBack}
    onNext={(data) => {
      // data contient toutes les infos paiement + imageFile
      setEventData(prev => ({ ...prev, ...data }));
      handleNextStep();
    }}
  />
    )}
    {step === 4 && (
  <Resume
    eventData={eventData}
    onBack={goBack}
    onPublish={handlePublish} 
  />
    )}


    </div>
  );
};

const MyEvents = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const getStatusLabel = (status) => {
  switch (status) {
    case -2:
      return { label: "Reporté", color: "bg-yellow-100 text-yellow-800" };
    case -1:
      return { label: "Annulé", color: "bg-red-100 text-red-800" };
    case 0:
      return { label: "En cours", color: "bg-blue-100 text-blue-800" };
    case 1:
      return { label: "Terminé", color: "bg-gray-200 text-gray-700" };
    default:
      return { label: "Inconnu", color: "bg-gray-100 text-gray-500" };
  }
};


 


  useEffect(() => {
    if (!userId) return;

    axios.get(`${import.meta.env.VITE_API_URL}/account/my-events`, {
      withCredentials: true
    })
    .then(res => {
      setEvents(res.data.events);
    })
    .catch(err => {
      console.error(err);
      message.error("Erreur lors du chargement des événements.");
    })
    .finally(() => setLoading(false));
  }, [userId]);

    if (loading) return <Spin />;




   return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mes événements créés</h1>
      {events.length === 0 ? (
        <p>Aucun événement pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Link to={`/event/${event.id}`} key={event.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
              <img
                src={`${import.meta.env.VITE_API_URL}${event.image_url}`}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-gray-500">Créé le {dayjs(event.created_at).format('DD MMMM YYYY')}</p>
              {(() => {
  const { label, color } = getStatusLabel(event.status);
  return (
    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${color}`}>
      {label}
    </span>
  );
})()}

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus(null); // Clear les anciens messages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/account/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ success: true, message: data.message || 'Mot de passe mis à jour avec succès.' });
        setFormData({ currentPassword: '', newPassword: '' });
      } else {
        setStatus({ success: false, message: data.message || 'Erreur.' });
      }
    } catch (err) {
      setStatus({ success: false, message: 'Erreur serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sécurité</h1>
      <p className="mb-6 text-gray-600">Change ton mot de passe ici.</p>

      {status && (
        <div className={`mb-4 p-3 rounded ${status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium">Mot de passe actuel</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Nouveau mot de passe</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Doit contenir une majuscule, une minuscule, un caractère spécial et faire au moins 8 caractères.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  );
};




export default Dashboard;
