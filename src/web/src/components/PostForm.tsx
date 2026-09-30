import { useState, type SubmitEvent } from 'react'
import { ApiError } from '../types.ts'

export default function PostForm({ onCreate }: { onCreate: (body: string) => Promise<void> }) {
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = body.trim()
    if (!next) return
    setError('')
    setPending(true)
    try {
      await onCreate(next)
      setBody('')
    } catch (err: unknown) {
      setError(messageFrom(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <input
        placeholder="Write a post"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        Create
      </button>
      {error && <p>{error}</p>}
    </form>
  )
}

function messageFrom(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Request failed'
}
