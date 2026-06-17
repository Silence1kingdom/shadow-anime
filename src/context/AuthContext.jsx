import { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { fbAuth } from '../firebase/config'
import { supabase } from '../supabase/config'

const AuthContext = createContext()
const ADMIN_EMAIL = 'vectorblack03@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const isAdmin = user?.email === ADMIN_EMAIL

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: name || email.split('@')[0] } } })

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(fbAuth, googleProvider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const googleIdToken = credential.idToken
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: googleIdToken,
    })
    if (error) throw error
    return data
  }

  const signInWithMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, redirectTo: window.location.origin }
    })
    if (error) throw error
    return data
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signInWithMagicLink, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
