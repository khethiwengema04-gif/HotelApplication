import { Route, Routes } from 'react-router-dom'
// import { Home } from './Components/Pages/Home/Home'
import Register from './components/pages/register/register'
// import Profile from './Components/Pages/Profile/Profile'
import { Landing } from './components/pages/landing/landing'

function App() {
  return (
    <>

      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/register" element={<Register />} />
        {/* <Route path="/profilepage" element={<Profile />} /> */}
      </Routes>
    </>

  )
}

export default App