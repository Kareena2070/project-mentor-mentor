import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/home'
import Login from './auth/login'
import Register from './auth/register'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className='navbar'>
        <div className='nav-head'>
          <h1>NavGurukul</h1>
          <p>Progress Tracker</p>
        </div>

        {/* Hamburger button */}
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-link ${isOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/addTask" onClick={() => setIsOpen(false)}>Add Task</Link></li>
          <li><Link to="/progress" onClick={() => setIsOpen(false)}>Progress</Link></li>
          <li><Link to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </>
  )
}

export default App
