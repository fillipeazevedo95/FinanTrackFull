import AppRoutes from './routes/AppRoutes'
import PWAPrompt from './components/PWAPrompt'
import InstallPWA from './components/InstallPWA'
import UserProvider from './contexts/UserContext'
import './style.css'

function App() {
  return (
    <UserProvider>
      <AppRoutes />
      <PWAPrompt />
      <InstallPWA />
    </UserProvider>
  )
}

export default App
