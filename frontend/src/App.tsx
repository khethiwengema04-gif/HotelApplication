import { Route, Routes } from 'react-router-dom'
// import { Home } from './Components/Pages/Home/Home'
import Register from './components/pages/register/register'
// import Profile from './Components/Pages/Profile/Profile'
import { Landing } from './components/pages/landing/landing'
import Login from './components/pages/login/login'
import Admin from './components/pages/admin/admin'


function App() {
  return (
    <>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={< Admin />} />

      </Routes>
    </>

  )
}

export default App