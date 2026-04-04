import './App.css'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Camera, Home, Shirt, User } from 'lucide-react'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Wardrobe from './pages/Wardrobe.jsx'
import Feed from './pages/Home.jsx' // This is the premium clothing feed
import UserProfile from './pages/UserProfile.jsx'
import Dock from './components/Dock.jsx'

function AppDock() {
  const navigate = useNavigate();

  const items = [
    {
      icon: <Home size={20} className="text-white" />,
      label: 'Home',
      onClick: () => navigate('/home')
    },
    {
      icon: <User size={20} className="text-white" />,
      label: 'User',
      onClick: () => navigate('/user')
    },
    {
      icon: <Shirt size={20} className="text-white" />,
      label: 'Wardrobe',
      onClick: () => navigate('/wardrobe')
    }
  ];

  return (
    <Dock
      items={items}
      panelHeight={60}
      baseItemSize={48}
      magnification={70}
      distance={150}
    />
  );
}

/* Floating AR Try-On button — top right on post-login screens */
function ARButton() {
  return (
    <button
      className="fixed top-6 right-6 z-50 w-14 h-14 rounded-full bg-zinc-900 text-white shadow-2xl shadow-zinc-900/40 flex items-center justify-center hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-300 border border-zinc-800"
      title="Start AR Try-On"
    >
      <Camera size={24} />
    </button>
  );
}

function App() {
  const location = useLocation();
  const signedInRoutes = ['/home', '/wardrobe', '/user'];
  const showAppUI = signedInRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Feed />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showAppUI && <ARButton />}
      {showAppUI && <AppDock />}
    </>
  );
}

export default App
