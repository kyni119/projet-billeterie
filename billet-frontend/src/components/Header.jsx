import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    const categoryMap = {
      Conférence: 1,
      Concert: 2,
      Atelier: 3,
      Séminaire: 4,
      Festival: 5,
      Spectacle: 19,
      Evenements: -1,
    };
    const categoryId = categoryMap[categoryName];
    if (categoryId) navigate(`/search?category_id=${categoryId}`);
  };

  return (
    <header className="bg-white text-black w-full border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center py-4 px-6 relative">
        {/* Logo à gauche (fixed) */}
        <div
          className="text-5xl font-londrina font-bold cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
        >
          ~Ticky~
        </div>
{/* Navigation centrée avec gestion responsive */}
<nav className="hidden lg:flex absolute  left-1/2  transform -translate-x-1/2 space-x-6 max-w-[80vw] overflow-x-auto py-2">
  {["Concert", "Festival", "Conférence", "Evenements"].map((name) => (
    <button
      key={name}
      onClick={() => handleCategoryClick(name)}
      className="font-poppins relative group px-2 py-1 cursor-pointer whitespace-nowrap"
    >
      {name}
      {/* Animation de soulignement */}
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-black group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
    </button>
  ))}
</nav>

        {/* Profile à droite (fixed) */}
        <div className="ml-auto flex-shrink-0">
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CgProfile className="text-2xl" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="font-poppins border border-black bg-black text-white px-4 py-1.5 rounded-full hover:bg-opacity-90 transition-all"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/register')}
                className="font-poppins border border-gray-300 px-4 py-1.5 rounded-full hover:border-black transition-all"
              >
                S'inscrire
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;