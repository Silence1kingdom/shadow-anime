import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../context/I18nContext'

const wrapperStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-primary)',
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  borderRadius: 12,
  padding: '40px 36px',
  width: 380,
}

const titleStyle = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  textAlign: 'center',
  marginBottom: 8,
}

const subtitleStyle = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginBottom: 28,
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)',
  color: 'var(--text-primary)',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const btnStyle = {
  width: '100%',
  padding: '12px 0',
  border: 'none',
  borderRadius: 6,
  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  color: '#fff',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 16,
}

const errorStyle = {
  color: 'var(--rose)',
  fontSize: 14,
  textAlign: 'center',
  marginTop: 12,
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signOut } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError(t('admin.emailRequired')); return }
    setError('')
    setLoading(true)
    try {
      const userCred = await signIn(email, password)
      if (userCred.user?.email !== 'vectorblack03@gmail.com') {
        await signOut()
        setError(t('admin.accessDenied'))
        setLoading(false)
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={wrapperStyle}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <div style={titleStyle}>{t('admin.login')}</div>
        <div style={subtitleStyle}>{t('admin.loginSubtitle')}</div>
        <div style={{ marginBottom: 14 }}>
          <input
            style={inputStyle}
            type="email"
            placeholder={t('admin.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            style={inputStyle}
            type="password"
            placeholder={t('admin.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button style={btnStyle} type="submit" disabled={loading}>
          {loading ? t('admin.loggingIn') : t('admin.loginButton')}
        </button>
        {error && <div style={errorStyle}>{error}</div>}
      </form>
    </div>
  )
}

export default AdminLogin
