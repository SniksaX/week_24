import { useState } from 'react'
import { ApiError, type Post } from '../types.ts'

export default function PostList({
  posts,
  onRemove,
}: {
  posts: Post[]
  onRemove: (id: number) => Promise<void>
}) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function remove(id: number) {
    setPendingId(id)
    setError('')
    try {
      await onRemove(id)
    } catch (err: unknown) {
      setError(messageFrom(err))
    } finally {
      setPendingId(null)
    }
  }

  if (posts.length === 0) return <p>No posts yet</p>

  return (
    <>
      {error && <p>{error}</p>}
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.body} {new Date(post.createdAt).toLocaleString()}{' '}
            <button
              type="button"
              onClick={() => void remove(post.id)}
              disabled={pendingId === post.id}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function messageFrom(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Request failed'
}
