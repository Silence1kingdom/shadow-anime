import { useState, useEffect } from 'react'
import { useToast } from '../../components/Toast'
import { useI18n } from '../../context/I18nContext'
import { supabase } from '../../supabase/config'
import { getCoupons, addCoupon } from '../../supabase/data'

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

const labelStyle = { color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }
const btnPrimary = { padding: '10px 22px', border: 'none', borderRadius: 6, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const btnDanger = { padding: '6px 14px', border: 'none', borderRadius: 4, background: 'var(--rose)', color: '#fff', fontSize: 13, cursor: 'pointer', marginLeft: 8 }
const inputGroup = { marginBottom: 14 }

function AdminCoupons() {
  const toast = useToast()
  const { t } = useI18n()
  const [coupons, setCoupons] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minAmount: '', expiresAt: '' })

  useEffect(() => {
    getCoupons().then(setCoupons)
  }, [])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const openAdd = () => {
    setEditId(null)
    setForm({ code: '', type: 'percentage', value: '', minAmount: '', expiresAt: '' })
    setShowForm(true)
  }

  const openEdit = (c) => {
    setEditId(c.code)
    setForm({ code: c.code, type: c.type, value: c.value, minAmount: c.minAmount || '', expiresAt: c.expiresAt || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editId) {
      await supabase.from('coupons').update({ ...form, value: Number(form.value), minAmount: Number(form.minAmount) || 0 }).eq('code', editId)
    } else {
      const existing = await getCoupons()
      if (existing.some(c => c.code === form.code)) { toast(t('admin.couponExists'), 'error'); return }
      await addCoupon({ ...form, value: Number(form.value), minAmount: Number(form.minAmount) || 0 })
    }
    const updated = await getCoupons()
    setCoupons(updated)
    setShowForm(false)
    setEditId(null)
  }

  const del = async (code) => {
    if (!confirm(t('admin.deleteCouponConfirm'))) return
    await supabase.from('coupons').delete().eq('code', code)
    const updated = await getCoupons()
    setCoupons(updated)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('admin.coupons')}</h1>
        <button style={btnPrimary} onClick={openAdd}>{t('admin.addCoupon', '+ Add Coupon')}</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 24, marginBottom: 24, maxWidth: 480 }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 18, margin: '0 0 16px 0' }}>
            <i className="fa fa-tag" style={{ marginRight: 8 }} />{editId ? t('admin.editCoupon', 'Edit Coupon') : t('admin.addCoupon', 'Add Coupon')}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.couponCode')}</label>
              <input style={inputStyle} name="code" value={form.code} onChange={handleChange} required placeholder={t('admin.codePlaceholder', 'e.g. SAVE10')} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.couponType', 'Type')}</label>
              <select style={inputStyle} name="type" value={form.type} onChange={handleChange}>
                <option value="percentage">{t('admin.percentage', 'Percentage (%)')}</option>
                <option value="fixed">{t('admin.fixedAmount', 'Fixed Amount (EGP)')}</option>
              </select>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.couponValue', 'Value')}</label>
              <input style={inputStyle} name="value" type="number" step="0.01" value={form.value} onChange={handleChange} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.minOrderAmount', 'Min. Order Amount (0 = no min)')}</label>
              <input style={inputStyle} name="minAmount" type="number" value={form.minAmount} onChange={handleChange} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.expiryDate', 'Expiry Date (optional)')}</label>
              <input style={inputStyle} name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} type="submit">{editId ? t('admin.update') : t('admin.save')}</button>
              <button style={{ ...btnDanger, marginLeft: 0 }} type="button" onClick={() => setShowForm(false)}>{t('admin.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.couponCode')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.couponType', 'Type')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.couponValue', 'Value')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.minOrder', 'Min Order')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.expires', 'Expires')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={c.code} style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--purple-light)' }}>{c.code}</td>
                <td style={{ padding: '12px 16px' }}>{c.type === 'percentage' ? '%' : 'EGP'}</td>
                <td style={{ padding: '12px 16px' }}>{c.type === 'percentage' ? `${c.value}%` : `EGP ${c.value}`}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.minAmount ? `EGP ${c.minAmount}` : '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.expiresAt || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ padding: '6px 14px', border: 'none', borderRadius: 4, background: '#3b82f6', color: '#fff', fontSize: 13, cursor: 'pointer' }} onClick={() => openEdit(c)}><i className="fa fa-pencil" /></button>
                  <button style={btnDanger} onClick={() => del(c.code)}><i className="fa fa-trash" /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}><i className="fa fa-tag" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }} />{t('admin.noCoupons')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCoupons
