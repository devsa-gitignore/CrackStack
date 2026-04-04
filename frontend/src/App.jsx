import './App.css'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Camera, Home, Shirt, User } from 'lucide-react'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Wardrobe from './pages/Wardrobe.jsx'
import Feed from './pages/Home.jsx'
import UserProfile from './pages/UserProfile.jsx'
import TryOn from './pages/TryOn.jsx'
import Dock from './components/Dock.jsx'

function AppDock() {
  const navigate = useNavigate()

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
    },
    {
      icon: <Camera size={20} className="text-white" />,
      label: 'Try On',
      onClick: () => navigate('/home')
    }
  ]

  return (
    <Dock
      items={items}
      panelHeight={60}
      baseItemSize={46}
      magnification={66}
      distance={150}
    />
  )
}

function AppHeader() {
  const navigate = useNavigate()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-2xl font-extrabold tracking-tighter text-zinc-900"
        >
          outfyt<span className="text-zinc-400">.</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-zinc-800"
          title="Start AR Try-On"
        >
          <Camera size={16} />
          Try On
        </button>
      </div>
    </header>
  )
}

function App() {
  const location = useLocation()
  const signedInRoutes = ['/home', '/wardrobe', '/user']
  const showAppUI = signedInRoutes.includes(location.pathname)

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Feed />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/try-on" element={<TryOn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showAppUI && <AppHeader />}
      {showAppUI && <AppDock />}
    </>
  )
}

export default App
