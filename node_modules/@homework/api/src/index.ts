import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { router } from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS - разрешаем запросы с фронтенда
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (мобильные приложения, Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed!))) {
      return callback(null, true)
    }
    
    callback(null, true) // Пока разрешаем все для простоты
  },
  credentials: true,
}))

app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Homework Tracker API' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api', router)

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})