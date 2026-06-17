import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import { getContactMessages, deleteContactMessage } from '../../utils/siteData'

const btnDanger = { padding: '6px 14px', border: 'none', borderRadius: 4, background: 'var(--rose)', color: '#fff', fontSize: 13, cursor: 'pointer' }

function AdminContactMessages() {
  const [messages, setMessages] = useState([])
  const { t } = useI18n()

  useEffect(() => {
    getContactMessages().then(setMessages)
  }, [])

  const del = async (id) => {
    if (!confirm(t('admin.deleteMessageConfirm'))) return
    await deleteContactMessage(id)
    const updated = await getContactMessages()
    setMessages(updated)
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        <i className="fa fa-envelope" style={{ marginRight: 10 }} />{t('admin.contactMessages')}
      </h1>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.name')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.email')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.message', 'Message')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.date')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m, i) => (
              <tr key={i} style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{m.email}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: 300, wordBreak: 'break-word' }}>{m.message}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>{m.date ? new Date(m.date).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                    <button style={btnDanger} onClick={() => del(m.id)}><i className="fa fa-trash" style={{ marginRight: 4 }} />{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                <i className="fa fa-envelope-o" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }} />
                {t('admin.noMessages')}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminContactMessages
