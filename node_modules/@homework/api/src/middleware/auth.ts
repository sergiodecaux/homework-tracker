import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

export interface AuthRequest extends Request {
  userId?: string
  user?: {
    id: string
    telegramId: number
    name: string
    role: string
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader?.startsWith('Bearer ')) {
      // В dev режиме пропускаем без токена
      if (process.env.NODE_ENV === 'development') {
        req.userId = 'user-1'
        return next()
      }
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    req.userId = decoded.userId
    req.user = decoded
    
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function generateToken(user: { id: string; telegramId?: number; name: string; role: string }) {
  return jwt.sign(
    { userId: user.id, ...user },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}