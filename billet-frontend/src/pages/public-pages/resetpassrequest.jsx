import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi'; 
import { Link, useNavigate } from 'react-router-dom';

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de la demande.');
      } else {
        setMessage(data.message || 'Un email de réinitialisation a été envoyé.');
        setTimeout(() => navigate('/login'), 5000);
      }
    } catch {
      setError('Erreur serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200">
         {/* Header flottant avec icône + titre */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/login" className="flex items-center text-black hover:text-red-800">
          <FiArrowLeft className="text-2xl mr-2" />
          <span className="hidden sm:inline">Connexion</span>
        </Link>
      </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-[#0D1B2A]">Mot de passe oublié</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
          />

          <button
            type="submit"
            className="w-full bg-[#0D1B2A] text-white py-3 rounded-md text-lg font-semibold transition hover:bg-black flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
