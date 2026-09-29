import { api } from './api.ts'

export type User = { email: string }

export function me() {
  return api<{ user: User }>('/api/auth/me')
}

export function login(email: string, password: string) {
  return api<{ user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(email: string, password: string) {
  return api<{ user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout() {
  return api<{ message: string }>('/api/auth/logout', { method: 'POST' })
}
