import { useState, useEffect } from 'react'
import { useToast } from '../../components/Toast'
import { useI18n } from '../../context/I18nContext'
import { getGiftCards, addGiftCard, deleteGiftCardByCode } from '../../utils/siteData'

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const labelStyle = { color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }
const btnPrimary = { padding: '10px 22px', border: 'none', borderRadius: 6, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const btnDanger = { padding: '6px 14px', border: 'none', borderRadius: 4, background: 'var(--rose)', color: '#fff', fontSize: 13, cursor: 'pointer', marginLeft: 8 }
const inputGroup = { marginBottom: 14 }

function generateCode() {
  const p = () => Math.random().toString(36).toUpperCase().slice(2, 6)
  return `GIFT-${p()}-${p()}`
}

function AdminGiftCards() {
  const toast = useToast()
  const { t } = useI18n()
  const [cards, setCards] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: '', recipient: '', message: '' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    getGiftCards().then(setCards)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { toast?.('Enter a valid amount', 'warning'); return }
    const card = {
      code: generateCode(),
      amount: Number(form.amount),
      remaining: Number(form.amount),
      recipient: form.recipient.trim(),
      message: form.message.trim(),
      created: new Date().toISOString(),
      usedBy: null,
      usedAt: null,
      status: 'active',
    }
    await addGiftCard(card)
    const updated = await getGiftCards()
    setCards(updated)
    setShowForm(false)
    setForm({ amount: '', recipient: '', message: '' })
    toast?.(`Gift card ${card.code} created!`, 'success')
  }

  const handleDelete = async (code) => {
    await deleteGiftCardByCode(code)
    const updated = await getGiftCards()
    setCards(updated)
  }

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code)
    toast?.(`Copied: ${code}`, 'success')
  }

  const totalIssued = cards.reduce((s, c) => s + c.amount, 0)
  const totalRemaining = cards.reduce((s, c) => s + c.remaining, 0)
  const totalUsed = totalIssued - totalRemaining
  const activeCount = cards.filter(c => c.status === 'active' || c.remaining > 0).length

  const filtered = cards.filter(c => {
    if (statusFilter === 'Active' && (c.status !== 'active' || c.remaining <= 0)) return false
    if (statusFilter === 'Consumed' && (c.status !== 'consumed' || c.remaining > 0)) return false
    if (statusFilter === 'Partial' && (c.remaining >= c.amount || c.remaining <= 0)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.code.toLowerCase().includes(q) || c.recipient.toLowerCase().includes(q) || (c.usedBy || '').toLowerCase().includes(q)
  })

  const statusStyle = (card) => {
    if (card.remaining <= 0) return { bg: 'rgba(239,68,68,0.15)', color: 'var(--rose)', label: t('admin.consumed', 'Consumed') }
    if (card.remaining < card.amount) return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: t('admin.partiallyUsed', 'Partial') }
    return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: t('admin.active', 'Active') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('admin.giftCards', 'Gift Cards')}</h1>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          <i className={`fa ${showForm ? 'fa-times' : 'fa-plus-circle'}`} style={{ marginRight: 6 }} />
          {showForm ? t('admin.cancel') : t('admin.issueGiftCard', 'Issue Gift Card')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 130px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.totalIssued', 'Total Issued')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--purple-light)' }}>EGP {totalIssued.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 130px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.totalRemaining', 'Remaining')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>EGP {totalRemaining.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 130px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.totalUsed', 'Used')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: totalUsed > 0 ? '#f59e0b' : 'var(--text-muted)' }}>EGP {totalUsed.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 80px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.activeCount', 'Active')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{activeCount}</div>
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 24, marginBottom: 20, maxWidth: 500 }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 18, margin: '0 0 16px 0' }}>
            <i className="fa fa-gift" style={{ marginRight: 8, color: 'var(--purple)' }} />
            {t('admin.issueGiftCard', 'Issue Gift Card')}
          </h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.giftCardAmount', 'Amount (EGP)')}</label>
              <input style={inputStyle} type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.giftCardRecipient', 'Recipient Email (optional)')}</label>
              <input style={inputStyle} type="email" value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.giftCardMessage', 'Message (optional)')}</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} type="submit"><i className="fa fa-gift" style={{ marginRight: 6 }} />{t('admin.generate', 'Generate')}</button>
              <button style={{ ...btnDanger, marginLeft: 0 }} type="button" onClick={() => setShowForm(false)}>{t('admin.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {['All', 'Active', 'Partial', 'Consumed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: statusFilter === s ? 'var(--purple)' : 'rgba(255,255,255,0.04)',
            color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}>
            {s === 'All' ? t('admin.productAll', 'All') : s}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.searchGiftCards', 'Search by code or email...')}
          style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 220 }} />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.giftCardCode', 'Code')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.amount', 'Amount')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.remaining', 'Remaining')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.status', 'Status')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.usedBy', 'Used By')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.date', 'Date')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const st = statusStyle(c)
              return (
                <tr key={c.code} style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{c.code}</span>
                      <button onClick={() => handleCopy(c.code)} title="Copy code"
                        style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', fontSize: 14, padding: 2 }}>
                        <i className="fa fa-copy" />
                      </button>
                    </div>
                    {c.recipient && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.recipient}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>EGP {c.amount}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: c.remaining > 0 ? '#22c55e' : 'var(--rose)' }}>EGP {c.remaining}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>{c.usedBy || '-'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                    <div>{new Date(c.created).toLocaleDateString()}</div>
                    {c.usedAt && <div style={{ marginTop: 2, fontSize: 11 }}>Used: {new Date(c.usedAt).toLocaleDateString()}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={btnDanger} onClick={() => handleDelete(c.code)}>
                      <i className="fa fa-trash" style={{ marginRight: 4 }} />{t('admin.delete')}
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                <i className="fa fa-gift" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }} />
                {t('admin.noGiftCards', 'No gift cards issued yet.')}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminGiftCards
