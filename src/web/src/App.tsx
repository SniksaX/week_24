import { useEffect, useState, type FormEvent } from 'react'

type User = { id: number; email: string }
type Post = { id: number; body: string; createdAt: string }
type Page = 'login' | 'register'

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const data = (await response.json().catch(() => ({}))) as T & { message?: string }
  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed')
  }
  return data
}

function go(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function App() {
  const [route, setRoute] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (route === '/user') {
    return <UserPage />
  }

  return <AuthPage />
}

function AuthPage() {
  const [page, setPage] = useState<Page>('login')

  useEffect(() => {
    api<{ user: User }>('/api/auth/me')
      .then(() => go('/user'))
      .catch(() => {})
  }, [])

  return page === 'login' ? (
    <AuthForm
      title="Login"
      submitLabel="Login"
      path="/api/auth/login"
      switchLabel="Need an account? Register"
      onSwitch={() => setPage('register')}
    />
  ) : (
    <AuthForm
      title="Register"
      submitLabel="Register"
      path="/api/auth/register"
      switchLabel="Have an account? Login"
      onSwitch={() => setPage('login')}
    />
  )
}

function AuthForm({
  title,
  submitLabel,
  path,
  switchLabel,
  onSwitch,
}: {
  title: string
  submitLabel: string
  path: string
  switchLabel: string
  onSwitch: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await api<{ user: User }>(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      go('/user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit">{submitLabel}</button>
      </form>
      {error && <p>{error}</p>}
      <button type="button" onClick={onSwitch}>
        {switchLabel}
      </button>
    </main>
  )
}

function UserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api<{ user: User }>('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => go('/'))
      .finally(() => setReady(true))
  }, [])

  if (!ready || !user) return <p>Loading...</p>

  return <Posts user={user} />
}

function Posts({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const data = await api<{ posts: Post[] }>('/api/posts')
    setPosts(data.posts)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function createPost(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await api('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setBody('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  async function removePost(id: number) {
    setError('')
    try {
      await api(`/api/posts/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' })
    go('/')
  }

  return (
    <main>
      <h1>Posts</h1>
      <p>{user.email}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <form onSubmit={createPost}>
        <input
          placeholder="Write a post"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
      {error && <p>{error}</p>}
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.body}{' '}
            <button type="button" onClick={() => removePost(post.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
