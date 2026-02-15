import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './contexts/index'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)