import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/home/home'
import Register from './components/pages/register/register'
// import Profile from './Components/Pages/Profile/Profile'
import { Landing } from './components/pages/landing/landing'
import Login from './components/pages/login/login'
import Admin from './components/pages/admin/admin'
import AdminHotels from './components/pages/adminHotels/adminHotel'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/hotels" element={<AdminHotels />} />
      </Routes>
    </>

  )
}

export default App