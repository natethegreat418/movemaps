import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/theme.css'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import { AuthProvider } from './utils/AuthContext'
import Map from './components/Map'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/test-map" element={<Map />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
