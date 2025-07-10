import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil';
// import App from './App.jsx'
// import New from './pages/New.jsx'
import Router from './Router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>

    <BrowserRouter>

    <Router/>
    </BrowserRouter>
    </RecoilRoot>
  </StrictMode>,
)
