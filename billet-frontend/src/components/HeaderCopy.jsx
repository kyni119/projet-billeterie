import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeaderCopy = () => {

  const navigate = useNavigate();


  return (
    <header className="bg-black text-white w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center py-9 px-6 relative">

        <nav className=" lg:flex absolute  left-1/2  transform -translate-x-1/2 space-x-6 max-w-[80vw] overflow-x-auto py-2">
        <div
          className="text-5xl font-londrina font-bold cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
        >
          Ticky
        </div>
        </nav>

       
      </div>
    </header>
  );
};

export default HeaderCopy;