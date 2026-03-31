import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TrpcQueryProvider } from '@/lib/trpc'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrpcQueryProvider>
      <App />
    </TrpcQueryProvider>
  </StrictMode>,
)
