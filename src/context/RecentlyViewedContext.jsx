import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RecentlyViewedContext = createContext()

const MAX = 12

function load() {
  try {
    const saved = localStorage.getItem('recently_viewed')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function RecentlyViewedProvider({ children }) {
  const [recent, setRecent] = useState(load)

  useEffect(() => {
    try { localStorage.setItem('recently_viewed', JSON.stringify(recent)) } catch {}
  }, [recent])

  const addRecent = useCallback((product) => {
    if (!product || !product.id) return
    setRecent(prev => {
      const filtered = prev.filter(p => p.id !== product.id)
      return [product, ...filtered].slice(0, MAX)
    })
  }, [])

  return (
    <RecentlyViewedContext.Provider value={{ recent, addRecent }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext)
