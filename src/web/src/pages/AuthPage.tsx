import { useEffect, useState } from 'react'
import AuthForm from '../components/AuthForm.tsx'
import { me } from '../lib/auth.ts'
import { navigate } from '../lib/router.ts'
import { ApiError } from '../types.ts'

type Mode = 'login' | 'register'

function googleAuthError(): string {
  return new URLSearchParams(window.location.search).get('error') === 'google_auth'
    ? 'Google sign-in failed'
    : ''
}

function userDestination(): string {
  const payment = new URLSearchParams(window.location.search).get('payment')
  if (payment === 'success' || payment === 'cancelled') {
    return `/user?payment=${payment}`
  }
  return '/user'
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [ready, setReady] = useState(false)
  const [googleError] = useState(googleAuthError)

  useEffect(() => {
    if (googleError === '') return
    window.history.replaceState({}, '', window.location.pathname)
  }, [googleError])

  useEffect(() => {
    let ignore = false
    me()
      .then(() => {
        if (!ignore) navigate(userDestination())
      })
      .catch((err: unknown) => {
        if (ignore) return
        if (err instanceof ApiError && err.status === 401) {
          setReady(true)
          return
        }
        if (err instanceof Error) {
          setReady(true)
          return
        }
        setReady(true)
      })
    return () => {
      ignore = true
    }
  }, [])

  if (!ready) return <p>Loading...</p>

  return (
    <AuthForm
      mode={mode}
      initialError={googleError}
      onSuccess={() => navigate(userDestination())}
      onSwitch={() => setMode(mode === 'login' ? 'register' : 'login')}
    />
  )
}
