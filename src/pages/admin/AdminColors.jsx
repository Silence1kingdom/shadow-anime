import { useState, useEffect } from 'react'
import { applyColors } from '../../utils/siteData'
import { useI18n } from '../../context/I18nContext'
import { getSiteSettings, upsertSiteSetting } from '../../utils/siteData'

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

function AdminColors() {
  const [colors, setColors] = useState({ primary: '#8b5cf6', accent: '#06b6d4', bg: '#0a0a0f', text: '#f1f5f9', muted: '#94a3b8', cardBg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' })
  const [saved, setSaved] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings.admin_colors) {
        try {
          const parsed = typeof settings.admin_colors === 'string' ? JSON.parse(settings.admin_colors) : settings.admin_colors
          setColors(prev => ({ ...prev, ...parsed }))
          applyColors(parsed)
        } catch {}
      }
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setColors((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const merged = { ...colors }
      await upsertSiteSetting('admin_colors', merged)
      applyColors(merged)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  const resetColors = async () => {
    const defaults = { primary: '#8b5cf6', accent: '#06b6d4', bg: '#0a0a0f', text: '#f1f5f9', muted: '#94a3b8', cardBg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }
    setColors(defaults)
    try { await upsertSiteSetting('admin_colors', defaults) } catch {}
    applyColors(defaults)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const preset = [
    { name: 'primary', label: t('admin.primaryColor') },
    { name: 'accent', label: t('admin.accentColor') },
    { name: 'bg', label: t('admin.bgColor') },
    { name: 'text', label: t('admin.textColor') },
    { name: 'muted', label: t('admin.mutedTextColor') },
    { name: 'cardBg', label: t('admin.cardBackground') },
    { name: 'borderColor', label: t('admin.borderColor') },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        <i className="fa fa-paint-brush" style={{ marginRight: 10 }} />{t('admin.themeColors')}
      </h1>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 10,
        padding: 24,
        maxWidth: 480,
      }}>
        {preset.map((p) => (
          <div key={p.name} style={inputGroup}>
            <label style={labelStyle}>{p.label}</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                name={p.name}
                value={colors[p.name]}
                onChange={handleChange}
                style={{ width: 48, height: 40, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent' }}
              />
              <input
                style={inputStyle}
                name={p.name}
                value={colors[p.name]}
                onChange={handleChange}
              />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnPrimary} type="submit">
            <i className="fa fa-save" style={{ marginRight: 6 }} />{saved ? t('admin.saved') : t('admin.saveColors')}
          </button>
          <button type="button" onClick={resetColors} style={{ padding: '10px 22px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'transparent', color: 'var(--rose)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <i className="fa fa-refresh" style={{ marginRight: 6 }} />{t('admin.reset')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminColors
