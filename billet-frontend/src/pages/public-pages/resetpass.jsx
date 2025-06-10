import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const validations = [
      { regex: /.{8,}/, message: 'Au moins 8 caractères' },
      { regex: /[A-Z]/, message: 'Au moins une majuscule' },
      { regex: /[a-z]/, message: 'Au moins une minuscule' },
      { regex: /[0-9]/, message: 'Au moins un chiffre' },
      { regex: /[\W_]/, message: 'Au moins un caractère spécial' },
    ];
    return validations.every((v) => v.regex.test(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Le mot de passe ne respecte pas les critères de sécurité.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message || (data.errorMessage ? data.errorMessage.join(', ') : 'Erreur lors de la réinitialisation.')
        );
      } else {
        setMessage('Mot de passe réinitialisé avec succès ! Redirection en cours...');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
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
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0D1B2A]">Réinitialiser le mot de passe</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
            required
          />

          <input
            type="password"
            placeholder="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#0D1B2A] text-white py-3 rounded-md text-lg font-semibold transition hover:bg-black flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Réinitialiser'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
