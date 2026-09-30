import { useState, type SubmitEvent } from 'react'
import { login, register } from '../lib/auth.ts'
import { ApiError } from '../types.ts'
import GoogleButton from './GoogleButton.tsx'
 
export default function AuthForm({
  mode,
  onSuccess,
  onSwitch,
  initialError = '',
}: {
  mode: 'login' | 'register'
  onSuccess: () => void
  onSwitch: () => void
  initialError?: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      onSuccess()
    } catch (err: unknown) {
      setError(messageFrom(err))
    } finally {
      setPending(false)
    }
  }

  const title = mode === 'login' ? 'Login' : 'Register'
  const switchLabel =
    mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'

  return (
    <main>
      <h1>{title}</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={pending}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={pending}
        />
        <button type="submit" disabled={pending}>
          {title}
        </button>
      </form>
      <p>or</p>
      <GoogleButton disabled={pending} />
      {error && <p>{error}</p>}
      <button type="button" onClick={onSwitch} disabled={pending}>
        {switchLabel}
      </button>
    </main>
  )
}

function messageFrom(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return 'User already exists'
    if (err.status === 401) return 'Invalid credentials'
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Request failed'
}
