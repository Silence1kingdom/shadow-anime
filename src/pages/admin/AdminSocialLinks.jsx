import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import { getSocialLinks, upsertSocialLinks } from '../../supabase/data'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  color: 'var(--text-secondary)',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  display: 'block',
}

const inputGroup = { marginBottom: 14 }

const btnPrimary = {
  padding: '10px 22px',
  border: 'none',
  borderRadius: 6,
  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

function AdminSocialLinks() {
  const [links, setLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  })
  const [saved, setSaved] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    getSocialLinks().then(data => {
      if (data.length > 0) {
        const obj = {}
        data.forEach(link => { obj[link.platform] = link.url })
        setLinks(prev => ({ ...prev, ...obj }))
      }
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLinks((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const linksArray = Object.entries(links).map(([platform, url]) => ({ platform, url }))
      await upsertSocialLinks(linksArray)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  const platforms = [
    { name: 'facebook', icon: 'fa-facebook', label: t('social.facebook') },
    { name: 'twitter', icon: 'fa-twitter', label: t('social.twitter') },
    { name: 'instagram', icon: 'fa-instagram', label: t('social.instagram') },
    { name: 'youtube', icon: 'fa-youtube-play', label: t('social.youtube') },
    { name: 'tiktok', icon: 'fa-music', label: t('social.tiktok') },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        <i className="fa fa-share-alt" style={{ marginRight: 10 }} />{t('admin.socialLinks')}
      </h1>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 10,
        padding: 24,
        maxWidth: 480,
      }}>
        {platforms.map((p) => (
          <div key={p.name} style={inputGroup}>
            <label style={labelStyle}>
              <i className={`fa ${p.icon}`} style={{ marginRight: 6, width: 18 }} />{p.label}
            </label>
            <input style={inputStyle} name={p.name} value={links[p.name]} onChange={handleChange} placeholder={`https://${p.name}.com/...`} />
          </div>
        ))}
        <button style={btnPrimary} type="submit">
          <i className="fa fa-save" style={{ marginRight: 6 }} />{saved ? t('admin.saved') : t('admin.saveLinks')}
        </button>
      </form>
    </div>
  )
}

export default AdminSocialLinks
