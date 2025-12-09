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
    // Упрощённая валидация для разработки
    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    if (!userStr) return null
    
    return JSON.parse(userStr) as TelegramUser
  } catch (error) {
    console.error('Error validating Telegram data:', error)
    return null
  }
}