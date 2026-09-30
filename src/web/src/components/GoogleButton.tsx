import { googleLogin } from '../lib/auth.ts'

export default function GoogleButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <button type="button" onClick={googleLogin} disabled={disabled}>
      Continue with Google
    </button>
  )
}
