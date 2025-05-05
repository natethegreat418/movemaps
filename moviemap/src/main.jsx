import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { logEnvironmentInfo } from './utils/env'
import './index.css'

// Log environment information during startup
logEnvironmentInfo();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
