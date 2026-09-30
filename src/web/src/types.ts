export type User = {
  email: string
}

export type Post = {
  id: number
  userId: number
  body: string
  createdAt: string
}

export type Route = '/' | '/user'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
