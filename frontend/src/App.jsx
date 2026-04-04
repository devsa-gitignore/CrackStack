import './App.css'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Camera, Home, Shirt, ShoppingBag, User } from 'lucide-react'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Feed from './pages/Home.jsx'
import UserProfile from './pages/UserProfile.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import VendorPanel from './pages/VendorPanel.jsx'
import ARHub from './pages/ar/Index.jsx'
import LiveMode from './pages/ar/LiveMode.jsx'
import PhotoMode from './pages/ar/PhotoMode.jsx'
import ARVault from './pages/ar/Vault.jsx'
import Dock from './components/Dock.jsx'
import { useShop } from './context/ShopContext.jsx'

function AppDock() {
  const navigate = useNavigate()
  const { itemCount } = useShop()

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
      label: 'Vault',
      onClick: () => navigate('/ar/vault')
    },
    {
      icon: <Camera size={20} className="text-white" />,
      label: 'AR Mode',
      onClick: () => navigate('/ar/live')
    },
    {
      icon: <ShoppingBag size={20} className="text-white" />,
      label: itemCount > 0 ? `Cart ${itemCount}` : 'Cart',
      onClick: () => navigate('/cart')
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
  const { itemCount } = useShop()

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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:bg-zinc-50"
          >
            <ShoppingBag size={16} />
            {itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/ar/live')}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-zinc-800"
            title="Start AR Try-On"
          >
            <Camera size={16} />
            Live AR
          </button>
        </div>
      </div>
    </header>
  )
}

function App() {
  const location = useLocation()
  const signedInRoutes = ['/home', '/user', '/cart', '/checkout', '/vendor']
  const showAppUI = (signedInRoutes.includes(location.pathname) || location.pathname.startsWith('/product/')) && 
                    !location.pathname.startsWith('/ar')

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Feed />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/vendor" element={<VendorPanel />} />
        
        {/* Modern AR Suite */}
        <Route path="/ar" element={<ARHub />} />
        <Route path="/ar/live" element={<LiveMode />} />
        <Route path="/ar/photo" element={<PhotoMode />} />
        <Route path="/ar/vault" element={<ARVault />} />
        
        {/* Legacy Redirects */}
        <Route path="/try-on" element={<Navigate to="/ar/live" replace />} />
        <Route path="/wardrobe" element={<Navigate to="/ar/vault" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showAppUI && <AppHeader />}
      {showAppUI && <AppDock />}
    </>
  )
}

export default App
