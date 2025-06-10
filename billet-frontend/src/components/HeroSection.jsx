import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosSearch } from "react-icons/io";

// Remplacez par vos images
import image1 from '../assets/baniere.png';


const HeroSection = () => {

  const [fade, setFade] = useState(true);

  const placeholders = [
    "Reservez vos tickets ici",
    "Zouglou",
    "Coupé Décalé",
    "Rap-Ivoire",
    "Conférence",
    "Himra",
    "Didi B",
    "Palais de la culture",
    "Moins cher",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  // Gestion des placeholders
  useEffect(() => {
    const placeholderInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(placeholderInterval);
  }, [placeholders.length]);

  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && query.trim() !== '') {
      navigate(`/search?search_query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-white overflow-hidden">

      {/* Searchbar */}
      <div className="relative z-30 w-full max-w-2xl px-4 mt-3 mx-auto">
        <div className="relative group">
          <input
            type="text"
            placeholder={`${placeholders[placeholderIndex]}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full px-5 py-2 pr-12 text-1xl font-dmsans rounded-full shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/30 transition-all duration-300 bg-white"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-all duration-300 active:scale-95"
          >
            <IoIosSearch className="text-2xl text-gray-700 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    
      
    <div className="flex-grow flex flex-col items-center  overflow-hidden justify-between relative max-h-[90vh]  ">

        <div className="absolute z-10 text-center  px-40 py-10">
          <h1 className="font-anton text-[5rem] sm:text-[5em] md:text-[6rem] lg:text-[7rem] text-black mb-4 leading-none">
              Soyez dans la salle 
          </h1>
          <h1 className="font-anton text-[5rem] sm:text-[5rem] md:text-[6rem] lg:text-[7rem] text-black leading-none ">
            Quand l'histoire s'écrira
          </h1>
        </div>

    
      <div className="hidden lg:flex relative z-20 w-full h-full bottom-17  items-end justify-center min-h-screen">
  <img
    src={image1}
    alt="Event"
    className={`max-w-full  object-contain transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
    style={{
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
    }}
  />
</div>

      </div>
    </div>
  );
};

export default HeroSection;