import { api } from './api.ts'
import type { User } from '../types.ts'

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

export function googleLogin(): void {
  window.location.href = '/api/auth/google'
}

export function githubLogin(): void {
  window.location.href = '/api/auth/github'
}