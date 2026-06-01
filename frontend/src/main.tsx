import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { validateProductionBuild } from './config/env'
import './assets/styles/global.scss'
import App from './App.tsx'

validateProductionBuild()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={5000}
      expand
    />
  </StrictMode>,
)
