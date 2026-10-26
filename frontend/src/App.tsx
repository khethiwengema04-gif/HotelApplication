
import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/home/home'
import Register from './components/pages/register/register'
import { Landing } from './components/pages/landing/landing'
import Login from './components/pages/login/login'
import Admin from './components/pages/admin/admin'
import AdminHotels from './components/pages/adminHotels/adminHotel'
import AdminRooms from './components/adminRooms/adminRooms'
import HotelDetails from './components/pages/hotelDetails/hotelDetails'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />

      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/hotels" element={<AdminHotels />} />
      <Route path="/admin/rooms" element={<AdminRooms />} />

      <Route path="/hotels/:id" element={<HotelDetails />} />
    </Routes>
  )
}

export default App
