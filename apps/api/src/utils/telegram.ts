import crypto from 'crypto'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export function validateTelegramWebAppData(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')
    
    // Сортируем параметры
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    // Создаём secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest()
    
    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex')
    
    if (calculatedHash !== hash) {
      console.error('Invalid Telegram hash')
      return null
    }
    
    // Парсим данные пользователя
    const userStr = params.get('user')
    if (!userStr) return null
    
    return JSON.parse(userStr) as TelegramUser
  } catch (error) {
    console.error('Error validating Telegram data:', error)
    return null
  }
}