import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import { getSiteSettings, upsertSiteSetting } from '../../supabase/data'

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

function AdminSiteSettings() {
  const [form, setForm] = useState({ siteName: '', currency: 'EGP', shipping: '0', freeShippingThreshold: '0', tagline: '', description: '', address: '', phone: '', email: '', whatsapp: '', aiApiKey: '', aiModel: 'mistralai/Mistral-7B-Instruct-v0.2' })
  const [saved, setSaved] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    getSiteSettings().then(settings => {
      setForm(prev => ({ ...prev, ...settings }))
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) => upsertSiteSetting(key, value))
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        <i className="fa fa-cog" style={{ marginRight: 10 }} />{t('admin.siteSettings')}
      </h1>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 10,
        padding: 24,
        maxWidth: 480,
      }}>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.siteName')}</label>
          <input style={inputStyle} name="siteName" value={form.siteName} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.currency')}</label>
          <input style={inputStyle} name="currency" value={form.currency} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.shipping')}</label>
          <input style={inputStyle} name="shipping" value={form.shipping} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.freeShipping')}</label>
          <input style={inputStyle} name="freeShippingThreshold" value={form.freeShippingThreshold} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.tagline')}</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} name="tagline" value={form.tagline} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.siteDescription')}</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.address')}</label>
          <input style={inputStyle} name="address" value={form.address} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.phone')}</label>
          <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.email')}</label>
          <input style={inputStyle} name="email" value={form.email} onChange={handleChange} />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.whatsapp')}</label>
          <input style={inputStyle} name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+201000000000" />
        </div>

        <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 14, borderTop: '1px solid var(--border-glass)', paddingTop: 20 }}>
          <i className="fa fa-robot" style={{ marginRight: 8 }} />{t('admin.aiChatSettings')}
        </h3>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.hfApiKey')}</label>
          <input style={inputStyle} name="aiApiKey" value={form.aiApiKey} onChange={handleChange} placeholder="hf_xxxxxxxxxxxxxxxxxxxxx" type="password" />
          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>Get a free key at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)' }}>huggingface.co/settings/tokens</a></p>
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>{t('admin.aiModel')}</label>
          <input style={inputStyle} name="aiModel" value={form.aiModel} onChange={handleChange} placeholder="mistralai/Mistral-7B-Instruct-v0.2" />
          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>{t('admin.aiModelHelper')}</p>
        </div>

        <button style={btnPrimary} type="submit">
          <i className="fa fa-save" style={{ marginRight: 6 }} />{saved ? t('admin.saved') : t('admin.saveSettings')}
        </button>
      </form>
    </div>
  )
}

export default AdminSiteSettings
