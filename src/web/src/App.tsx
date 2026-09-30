import { useEffect } from 'react'
import { navigate, useRoute } from './lib/router'
import AuthPage from './pages/AuthPage'
import UserPage from './pages/UserPage'

export default function App() {
  const route = useRoute()

  useEffect(() => {
    if (route !== '/' && route !== '/user') {
      navigate('/')
    }
  }, [route])

  if (route === '/user') {
    return <UserPage />
  }

  return <AuthPage />
}
