import { useEffect } from 'react'

export function TelegramTheme() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp

    if (tg) {
      // Сообщаем Telegram что приложение готово
      tg.ready()
      tg.expand()

      // Получаем цвета темы из Telegram
      const themeParams = tg.themeParams || {}

      // Применяем цвета
      const root = document.documentElement

      if (themeParams.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color)
      }
      if (themeParams.secondary_bg_color) {
        root.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color)
      }
      if (themeParams.text_color) {
        root.style.setProperty('--tg-theme-text-color', themeParams.text_color)
      }
      if (themeParams.hint_color) {
        root.style.setProperty('--tg-theme-hint-color', themeParams.hint_color)
      }
      if (themeParams.link_color) {
        root.style.setProperty('--tg-theme-link-color', themeParams.link_color)
      }
      if (themeParams.button_color) {
        root.style.setProperty('--tg-theme-button-color', themeParams.button_color)
      }
      if (themeParams.button_text_color) {
        root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color)
      }

      // Слушаем изменение темы
      tg.onEvent('themeChanged', () => {
        const newTheme = tg.themeParams || {}
        if (newTheme.bg_color) root.style.setProperty('--tg-theme-bg-color', newTheme.bg_color)
        if (newTheme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', newTheme.secondary_bg_color)
        if (newTheme.text_color) root.style.setProperty('--tg-theme-text-color', newTheme.text_color)
        if (newTheme.hint_color) root.style.setProperty('--tg-theme-hint-color', newTheme.hint_color)
        if (newTheme.link_color) root.style.setProperty('--tg-theme-link-color', newTheme.link_color)
        if (newTheme.button_color) root.style.setProperty('--tg-theme-button-color', newTheme.button_color)
        if (newTheme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', newTheme.button_text_color)
      })
    }
  }, [])

  return null
}