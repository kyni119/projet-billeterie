import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft } from 'react-icons/fi'; 
import back from '../../assets/frapper.webp';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const [showModal, setShowModal] = useState(false);
const [modalMessage, setModalMessage] = useState('');
const [modalSuccess, setModalSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Erreur de connexion');
      setModalMessage(data.message || 'Erreur de connexion');
      setModalSuccess(false);
      setShowModal(true);
    } else {
      login(data.user);
      setModalMessage("Connexion réussie !");
      setModalSuccess(true);
      setShowModal(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  } catch (err) {
    setError('Erreur de connexion au serveur.');
    setModalMessage("Erreur de connexion au serveur.");
    setModalSuccess(false);
    setShowModal(true);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      {/* Header flottant avec icône + titre */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/" className="flex items-center text-white hover:text-gray-200">
          <FiArrowLeft className="text-2xl mr-2" />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>

      <div className="absolute top-6 w-full flex justify-center z-40">
        <h1 className="text-4xl sm:text-5xl text-white font-londrina tracking-wide">
          TICKY
        </h1>
      </div>

      {/* Fond + Formulaire */}
      <div
        className="min-h-screen flex justify-center items-center px-4"
        style={{
          backgroundImage: `url(${back})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-[#0D1B2A] rounded-lg shadow-lg p-10 bg-white bg-opacity-90 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-londrina mb-8 text-[#0D1B2A] text-center">
            Connexion
          </h2>

          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

          <input
            name="email"
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full border font-dmsans border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
            required
          />
          <input
            name="password"
            onChange={handleChange}
            placeholder="Mot de passe"
            type="password"
            className="w-full border font-dmsans border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
            required
          />

          <div className="flex justify-between items-center mb-6 text-sm">
            <Link to="/reset-password-request" className="text-[#0D1B2A] font-dmsans hover:underline">
              Mot de passe oublié ?
            </Link>
            <Link to="/register" className="text-[#0D1B2A] font-dmsans hover:underline">
              Pas encore inscrit ?
            </Link>
          </div>

        
          <button
  type="submit"
  disabled={loading}
  className={`w-full py-3 rounded-full font-semibold text-lg transition 
    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0D1B2A] hover:bg-black'} text-white`}
>
  {loading ? (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
    </div>
  ) : (
    'Se connecter'
  )}
</button>

        </form>
      </div>

      {showModal && (
  <div className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex items-center justify-center">
    <div className={`bg-white px-6 py-8 rounded-lg shadow-xl max-w-sm w-full text-center border-t-4 ${
      modalSuccess ? 'border-green-500' : 'border-red-500'
    }`}>
      <h3 className="text-xl font-semibold mb-4">
        {modalSuccess ? 'Succès 🎉' : 'Erreur ❌'}
      </h3>
      <p className="text-gray-700 mb-6">{modalMessage}</p>
      <button
        onClick={() => setShowModal(false)}
        className="bg-[#0D1B2A] text-white px-6 py-2 rounded-full hover:bg-black transition"
      >
        Fermer
      </button>
    </div>
  </div>
)}

    </>
  );
}
