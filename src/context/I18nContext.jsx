import { createContext, useContext, useState, useCallback } from 'react'
import en from '../translations/en.json'
import ar from '../translations/ar.json'

const I18nContext = createContext()

const locales = { en, ar }

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('lang') || 'en' } catch { return 'en' }
  })

  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch {}
    document.documentElement.setAttribute('lang', l)
    document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
  }, [])

  const t = useCallback((key, fallback) => {
    const keys = key.split('.')
    let val = locales[lang]
    for (const k of keys) {
      val = val?.[k]
    }
    return val || fallback || key
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
