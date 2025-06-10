import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/public-pages/home';
import SearchEvents from './pages/public-pages/events';
import EventDetails from './components/eventsolo';
import EventCheckOut from './pages/private-pages/ticketsChoice';
import Login from './pages/public-pages/login';
import Register from './pages/public-pages/register';
import Dashboard from './pages/private-pages/account';
import ProtectedRoute from './context/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ResetPasswordRequest from './pages/public-pages/resetpassrequest';
import ResetPassword from './pages/public-pages/resetpass';
import Step1EventDetails from './components/CreateEvent/Step1EventDetails';
import Step2Tickets from './components/CreateEvent/Step2Tickets';
import Step4And5Combined from './components/CreateEvent/Step4PaymentMethod';
import Step5Resume from './components/CreateEvent/Step3Resume';
import { ConfigProvider } from 'antd';
import ReservationDetails from './pages/reservation-pages/confirmation';
import frFR from 'antd/es/locale/fr_FR';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';

dayjs.locale('fr');

const App = () => {
  return (
    <AuthProvider>
      <ConfigProvider locale={frFR}>
        <div className='oho'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchEvents />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/event/:id/reservation" element={<EventCheckOut />} />
             <Route path="/reservation/:id" element={<ReservationDetails />} />


            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/create/step1" element={<Step1EventDetails />} />
            <Route path="/create/step2" element={<Step2Tickets />} />
            <Route path="/create/step3" element={<Step5Resume />} />
            <Route path="/create/step4" element={<Step4And5Combined />} />

            <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </div>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;

