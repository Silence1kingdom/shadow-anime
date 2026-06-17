import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

const wrapperStyle = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 16px',
}

const cardStyle = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 420,
}

const titleStyle = {
  fontSize: 26,
  fontWeight: 700,
  color: 'var(--text-primary)',
  textAlign: 'center',
  marginBottom: 4,
}

const subtitleStyle = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginBottom: 28,
}

const inputWrapperStyle = {
  position: 'relative',
  marginBottom: 18,
}

const iconStyle = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
  fontSize: 15,
  pointerEvents: 'none',
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)',
  color: 'var(--text-primary)',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const btnPrimaryStyle = {
  width: '100%',
  padding: '13px 0',
  border: 'none',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  color: '#fff',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
  transition: 'opacity 0.2s',
}

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  margin: '22px 0',
  color: 'var(--text-muted)',
  fontSize: 13,
}

const dividerLineStyle = {
  flex: 1,
  height: 1,
  background: 'rgba(255,255,255,0.08)',
}

const btnGoogleStyle = {
  width: '100%',
  padding: '13px 0',
  border: 'none',
  borderRadius: 8,
  background: '#fff',
  color: '#1e293b',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  transition: 'opacity 0.2s',
}

const footerStyle = {
  textAlign: 'center',
  marginTop: 22,
  color: 'var(--text-secondary)',
  fontSize: 14,
}

const linkStyle = {
  color: 'var(--purple)',
  textDecoration: 'none',
  fontWeight: 600,
}

const errorStyle = {
  color: 'var(--rose)',
  fontSize: 14,
  textAlign: 'center',
  marginTop: 12,
  marginBottom: 0,
}

function Register() {
  const { user, signUp, signInWithGoogle } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth.errorRequired'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.errorPasswords'))
      return
    }
    setLoading(true)
    try {
      const { error } = await signUp(email, password, name)
      if (error) throw error
      navigate('/')
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already registered' : err.code === 'auth/weak-password' ? 'Password too weak (min 6 chars)' : t('auth.errorGeneric'))
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch {
      setError(t('auth.errorGeneric'))
    }
  }

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('auth.createAccount')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <span>{t('auth.createAccount')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={wrapperStyle}>
        <form style={cardStyle} onSubmit={handleSubmit}>
          <div style={titleStyle}>{t('auth.createAccount')}</div>
          <div style={subtitleStyle}>{t('site.tagline')}</div>

          <div style={inputWrapperStyle}>
            <i className="fa fa-user" style={iconStyle}></i>
            <input
              style={inputStyle}
              type="text"
              placeholder={t('auth.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--purple)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              required
            />
          </div>

          <div style={inputWrapperStyle}>
            <i className="fa fa-envelope" style={iconStyle}></i>
            <input
              style={inputStyle}
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--purple)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              required
            />
          </div>

          <div style={inputWrapperStyle}>
            <i className="fa fa-lock" style={iconStyle}></i>
            <input
              style={inputStyle}
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--purple)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              required
            />
          </div>

          <div style={inputWrapperStyle}>
            <i className="fa fa-lock" style={iconStyle}></i>
            <input
              style={inputStyle}
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--purple)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              required
            />
          </div>

          <button
            style={{ ...btnPrimaryStyle, opacity: loading ? 0.6 : 1 }}
            type="submit"
            disabled={loading}
            onMouseEnter={(e) => { e.target.style.opacity = loading ? '0.6' : '0.9' }}
            onMouseLeave={(e) => { e.target.style.opacity = loading ? '0.6' : '1' }}
          >
            {loading ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Creating...</> : t('auth.createAccount')}
          </button>

          {error && <p style={errorStyle}>{error}</p>}

          <div style={dividerStyle}>
            <span style={dividerLineStyle}></span>
            <span>{t('auth.or')}</span>
            <span style={dividerLineStyle}></span>
          </div>

          <button
            style={btnGoogleStyle}
            type="button"
            onClick={handleGoogle}
            onMouseEnter={(e) => { e.target.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.target.style.opacity = '1' }}
          >
            <i className="fa fa-google"></i>
            {t('auth.signUpGoogle')}
          </button>

          <div style={footerStyle}>
            {t('auth.haveAccount')}{' '}
            <Link to="/login" style={linkStyle}>
              {t('auth.signInLink')}
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

export default Register
