import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/theme.css'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import { AuthProvider } from './utils/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
