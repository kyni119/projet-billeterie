import React, { useState } from 'react';
import axios from 'axios';

const LoginRegisterModal = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const url = tab === 'login' ? `${import.meta.env.VITE_API_URL}/auth/login` : `${import.meta.env.VITE_API_URL}/auth/register`;

    try {
      await axios.post(url, form, { withCredentials: true });
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>

        {/* Tabs */}
        <div className="flex justify-around mb-4">
          <button
            onClick={() => setTab('login')}
            className={`px-4 py-2 font-bold ${tab === 'login' ? 'border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Connexion
          </button>
          <button
            onClick={() => setTab('register')}
            className={`px-4 py-2 font-bold ${tab === 'register' ? 'border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <input type="text" name="firstName" placeholder="Prénom" onChange={handleChange} required className="input" />
              <input type="text" name="lastName" placeholder="Nom" onChange={handleChange} required className="input" />
              <input type="text" name="phoneNumber" placeholder="Téléphone" onChange={handleChange} required className="input" />
              <select name="profile" onChange={handleChange} required className="input">
                <option value="">Choisir un profil</option>
                <option value="0">Client</option>
                <option value="1">Organisateur</option>
              </select>
            </>
          )}

          <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="input" />
          <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required className="input" />

          {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegisterModal;
