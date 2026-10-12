import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { HiMenu, HiX } from 'react-icons/hi';

const CATEGORIES = {
  Concert: 2,
  Festival: 5,
  Conférence: 1,
  Atelier: 3,
  Spectacle: 19,
};

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const goCategory = (name) => go(`/search?category_id=${CATEGORIES[name]}`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 text-black backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => go('/')}
          className="flex-shrink-0 font-londrina text-4xl font-bold sm:text-5xl"
          aria-label="Ticky, retour à l'accueil"
        >
          ~Ticky~
        </button>

        {/* Navigation desktop */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 space-x-6 lg:flex" aria-label="Catégories">
          {['Concert', 'Festival', 'Conférence', 'Atelier'].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => goCategory(name)}
              className="group relative whitespace-nowrap px-2 py-1 font-poppins"
            >
              {name}
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:left-0 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => go('/dashboard')}
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
              aria-label="Mon espace"
            >
              <CgProfile className="text-3xl" />
            </button>
          ) : (
            <div className="hidden gap-3 sm:flex">
              <button
                type="button"
                onClick={() => go('/login')}
                className="rounded-full border border-ink bg-ink px-4 py-1.5 font-poppins text-white transition-all hover:bg-black"
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => go('/register')}
                className="rounded-full border border-gray-300 px-4 py-1.5 font-poppins transition-all hover:border-ink"
              >
                S'inscrire
              </button>
            </div>
          )}

          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 py-3 font-poppins lg:hidden" aria-label="Menu mobile">
          {Object.keys(CATEGORIES).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => goCategory(name)}
              className="block w-full rounded-lg px-3 py-3 text-left hover:bg-gray-50"
            >
              {name}
            </button>
          ))}
          {!user && (
            <div className="mt-2 flex gap-3 border-t border-gray-100 pt-3 sm:hidden">
              <button type="button" onClick={() => go('/login')} className="flex-1 rounded-full bg-ink py-2 text-white">
                Connexion
              </button>
              <button type="button" onClick={() => go('/register')} className="flex-1 rounded-full border border-gray-300 py-2">
                S'inscrire
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
