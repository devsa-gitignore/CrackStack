import './App.css'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Wardrobe from './pages/Wardrobe.jsx'
import Dock from './components/Dock.jsx'
import {
  Home, ShoppingBag, Shirt, User, Search
} from 'lucide-react'

function AppDock() {
  const navigate = useNavigate();

  const items = [
    {
      icon: <Home size={20} className="text-white" />,
      label: 'Home',
      onClick: () => navigate('/')
    },
    {
      icon: <Search size={20} className="text-white" />,
      label: 'Search',
      onClick: () => navigate('/wardrobe')
    },
    {
      icon: <Shirt size={20} className="text-white" />,
      label: 'Wardrobe',
      onClick: () => navigate('/wardrobe')
    },
    {
      icon: <ShoppingBag size={20} className="text-white" />,
      label: 'Try-On',
      onClick: () => navigate('/wardrobe')
    },
    {
      icon: <User size={20} className="text-white" />,
      label: 'Profile',
      onClick: () => navigate('/login')
    }
  ];

  return (
    <Dock
      items={items}
      panelHeight={56}
      baseItemSize={44}
      magnification={64}
      distance={150}
    />
  );
}

function App() {
  const location = useLocation();
  const hideDock = location.pathname === '/' || location.pathname === '/login';

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideDock && <AppDock />}
    </>
  )
}

export default App
