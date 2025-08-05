import AppRoutes from './routes/AppRoutes'
import PWAPrompt from './components/PWAPrompt'
import InstallPWA from './components/InstallPWA'
import './style.css'

function App() {
  return (
    <>
      <AppRoutes />
      <PWAPrompt />
      <InstallPWA />
    </>
  )
}

export default App
