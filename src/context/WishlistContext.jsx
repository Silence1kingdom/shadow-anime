import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getWishlist, addToWishlist as addWishlistItem, removeFromWishlist as removeWishlistItem } from '../supabase/data'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (user) {
      getWishlist(user.id).then(data => {
        setWishlist(data.map(item => item.products || item))
      })
    } else {
      setWishlist([])
    }
  }, [user])

  const toggleWishlist = useCallback(async (product) => {
    if (!user) return
    const exists = wishlist.some(p => p.id === product.id)
    if (exists) {
      await removeWishlistItem(user.id, product.id)
      setWishlist(prev => prev.filter(p => p.id !== product.id))
    } else {
      await addWishlistItem(user.id, product.id)
      setWishlist(prev => [...prev, product])
    }
  }, [user, wishlist])

  const isInWishlist = useCallback((id) => wishlist.some(p => p.id === id), [wishlist])

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
