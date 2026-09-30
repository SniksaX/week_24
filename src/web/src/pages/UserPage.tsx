import { useEffect, useState } from 'react'
import PostForm from '../components/PostForm.tsx'
import PostList from '../components/PostList.tsx'
import { api } from '../lib/api.ts'
import { logout, me } from '../lib/auth.ts'
import { navigate } from '../lib/router.ts'
import { ApiError, type Post, type User } from '../types.ts'

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsReady, setPostsReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    me()
      .then((data) => {
        if (!ignore) setUser(data.user)
      })
      .catch((err: unknown) => {
        if (ignore) return
        if (err instanceof ApiError && err.status === 401) {
          navigate('/')
          return
        }
        if (err instanceof Error) {
          navigate('/')
          return
        }
        navigate('/')
      })
      .finally(() => {
        if (!ignore) setReady(true)
      })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let ignore = false
    api<{ posts: Post[] }>('/api/posts')
      .then((data) => {
        if (ignore) return
        setPosts(data.posts)
        setPostsReady(true)
      })
      .catch((err: unknown) => {
        if (ignore) return
        if (err instanceof ApiError && err.status === 401) {
          navigate('/')
          return
        }
        setError(errorMessage(err))
        setPostsReady(true)
      })
    return () => {
      ignore = true
    }
  }, [user])

  async function onLogout() {
    try {
      await logout()
    } catch (err: unknown) {
      if (!(err instanceof ApiError) && !(err instanceof Error)) {
        setError('Request failed')
      }
    }
    navigate('/')
  }

  async function createPost(body: string) {
    try {
      const data = await api<{ post: Post }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setPosts((current) => [data.post, ...current])
      setError('')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/')
      }
      throw err
    }
  }

  async function removePost(id: number) {
    try {
      await api<{ message: string }>(`/api/posts/${id}`, { method: 'DELETE' })
      setPosts((current) => current.filter((post) => post.id !== id))
      setError('')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/')
      }
      throw err
    }
  }

  if (!ready || !user) return <p>Loading...</p>

  return (
    <main>
      <h1>Posts</h1>
      <p>{user.email}</p>
      <button type="button" onClick={() => void onLogout()}>
        Logout
      </button>
      {error && <p>{error}</p>}
      <PostForm onCreate={createPost} />
      {postsReady ? <PostList posts={posts} onRemove={removePost} /> : <p>Loading...</p>}
    </main>
  )
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Request failed'
}
