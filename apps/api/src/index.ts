import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { router } from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Homework Tracker API' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', router)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})