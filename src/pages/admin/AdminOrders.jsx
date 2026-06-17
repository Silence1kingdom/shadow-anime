import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import { supabase } from '../../supabase/config'
import { getOrders, updateOrderStatus } from '../../supabase/data'

const pageTitle = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 24,
}

const statusColors = {
  Pending: '#f59e0b',
  Packing: '#3b82f6',
  Shipped: 'var(--purple)',
  Delivered: '#22c55e',
  Rejected: 'var(--rose)',
}

const statusFlow = ['Pending', 'Packing', 'Shipped', 'Delivered']

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [trackingInput, setTrackingInput] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const { t } = useI18n()

  useEffect(() => {
    getOrders().then(setOrders)
  }, [])

  const updateStatus = async (id, newStatus) => {
    await updateOrderStatus(id, newStatus)
    const updated = await getOrders()
    setOrders(updated)
    if (selected?.id === id) {
      const found = updated.find(o => o.id === id)
      if (found) setSelected(found)
    }
  }

  const getNextStatus = (current) => {
    const idx = statusFlow.indexOf(current)
    if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1]
    return null
  }

  const deleteOrder = async (id) => {
    if (!confirm(t('admin.deleteOrderConfirm'))) return
    await supabase.from('orders').delete().eq('id', id)
    const updated = await getOrders()
    setOrders(updated)
    if (selected?.id === id) setSelected(null)
  }

  const setTracking = async (id) => {
    const num = trackingInput[id]
    if (!num) return
    await supabase.from('orders').update({ trackingNumber: num }).eq('id', id)
    const updated = await getOrders()
    setOrders(updated)
    if (selected?.id === id) {
      const found = updated.find(o => o.id === id)
      if (found) setSelected(found)
    }
  }

  const orderStatusIcon = (s) => {
    if (s === 'Pending') return 'fa-clock-o'
    if (s === 'Packing') return 'fa-cube'
    if (s === 'Shipped') return 'fa-truck'
    if (s === 'Delivered') return 'fa-check-circle'
    return 'fa-times-circle'
  }

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Status', 'Payment', 'Transaction ID', 'Date', 'GPS Lat', 'GPS Lng']
    const rows = orders.map(o => [
      o.id, o.customerName, o.customerEmail, o.billing?.phone || '',
      (o.billing?.address || '') + (o.billing?.apartment ? ', ' + o.billing?.apartment : ''),
      Array.isArray(o.items) ? o.items.map(i => `${i.nameAr || i.name} x${i.qty || 1}`).join('; ') : '',
      o.total, o.status, o.paymentMethod || '', o.paymentId || '', o.date || '',
      o.billing?.gpsLat || '', o.billing?.gpsLng || '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={pageTitle}>{t('admin.orders')}</h1>
          <input type="text" placeholder={t('admin.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 220 }} />
        </div>
        <button onClick={exportCSV} style={{
          padding: '8px 18px', border: 'none', borderRadius: 6,
          background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <i className="fa fa-download" />{t('admin.exportCsv')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Packing', 'Shipped', 'Delivered', 'Rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: statusFilter === s ? 'var(--purple)' : 'rgba(255,255,255,0.04)',
            color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}>
            {s === 'All' ? t('admin.productAll', 'All') : t('admin.' + s.toLowerCase())}
          </button>
        ))}
      </div>

      {(() => {
        const filtered = orders.filter(o => {
          if (statusFilter !== 'All' && o.status !== statusFilter) return false
          if (searchTerm) {
            const term = searchTerm.toLowerCase()
            return String(o.id).includes(term) ||
              (o.customerName || '').toLowerCase().includes(term) ||
              (o.customerEmail || '').toLowerCase().includes(term)
          }
          return true
        })
        return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 10,
        overflow: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.orderId')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.customer')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.items')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.total')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.status')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.tracking')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.date')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const next = getNextStatus(o.status)
              return (
                <tr key={o.id} style={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>#{o.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                  {o.customerName || o.customerEmail || '-'}
                  {o.billing?.phone && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{o.billing.phone}</div>}
                  {o.billing?.address && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.billing.address}{o.billing.apartment ? ', ' + o.billing.apartment : ''}</div>}
                </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {Array.isArray(o.items) ? o.items.map(item => `${item.nameAr || item.name} x${item.qty || 1}`).join(', ') : o.items || '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>EGP {Number(o.total || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={o.status || 'Pending'}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'var(--bg-glass)',
                        color: statusColors[o.status] || 'var(--text-primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Pending" style={{ color: statusColors.Pending }}>{t('admin.pending')}</option>
                      <option value="Packing" style={{ color: statusColors.Packing }}>{t('admin.packing')}</option>
                      <option value="Shipped" style={{ color: statusColors.Shipped }}>{t('admin.shipped')}</option>
                      <option value="Delivered" style={{ color: statusColors.Delivered }}>{t('admin.delivered')}</option>
                      <option value="Rejected" style={{ color: statusColors.Rejected }}>{t('admin.rejected')}</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {o.status === 'Shipped' || o.status === 'Delivered' ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="text" placeholder={t('admin.addTracking')} value={trackingInput[o.id] || ''} onChange={e => setTrackingInput(p => ({ ...p, [o.id]: e.target.value }))}
                          style={{ width: 90, padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 11, outline: 'none' }} />
                        <button onClick={() => setTracking(o.id)} style={{ padding: '4px 8px', border: 'none', borderRadius: 4, background: '#3b82f6', color: '#fff', fontSize: 10, cursor: 'pointer' }}><i className="fa fa-check" /></button>
                      </div>
                    ) : o.trackingNumber || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{o.date || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {next && o.status !== 'Rejected' ? (
                        <button
                          onClick={() => updateStatus(o.id, next)}
                          style={{
                            padding: '6px 10px',
                            border: 'none',
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <i className="fa fa-arrow-right" style={{ marginRight: 4 }} />
                          {next}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                      <button onClick={() => setSelected(o)} style={{
                        padding: '6px 10px', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4, background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: 11, cursor: 'pointer',
                      }}>
                        <i className="fa fa-eye" />
                      </button>
                      <button onClick={() => deleteOrder(o.id)} style={{
                        padding: '6px 10px', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 4, background: 'transparent', color: 'var(--rose)',
                        fontSize: 11, cursor: 'pointer',
                      }}>
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <i className="fa fa-shopping-cart" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }} />
                  {searchTerm ? t('admin.noOrdersMatch') : t('admin.noOrders')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        )})()}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 28, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: 18, margin: 0 }}>
                <i className="fa fa-shopping-cart" style={{ marginRight: 8, color: 'var(--purple)' }} />
                {t('admin.orderHash')}{selected.id}
              </h3>
              <button onClick={() => setSelected(null)} style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: 'var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>
                <i className="fa fa-times" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20,
                background: `${statusColors[selected.status] || 'var(--text-secondary)'}26`,
                color: statusColors[selected.status] || 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600,
              }}>
                <i className={`fa ${orderStatusIcon(selected.status)}`} />
                {selected.status}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'var(--bg-glass)', color: 'var(--text-secondary)', fontSize: 13 }}>
                <i className="fa fa-calendar" />{selected.date}
              </span>
              {selected.paymentMethod && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'var(--bg-glass)', color: 'var(--text-secondary)', fontSize: 13 }}>
                  <i className="fa fa-credit-card" />{selected.paymentMethod}
                </span>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>{t('admin.customerSection')}</h4>
              <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>{selected.customerName || '—'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selected.customerEmail || '—'}</div>
              {selected.billing?.phone && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selected.billing.phone}</div>}
              {selected.billing?.address && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selected.billing.address}{selected.billing.apartment ? ', ' + selected.billing.apartment : ''}</div>}
              {selected.billing?.gpsLat && selected.billing?.gpsLng && (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  <i className="fa fa-map-marker" style={{ marginRight: 4, color: 'var(--purple-light)' }} />
                  <a href={`https://www.google.com/maps?q=${selected.billing.gpsLat},${selected.billing.gpsLng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--purple)', textDecoration: 'underline', fontSize: 13 }}>
                    {selected.billing.gpsLat}, {selected.billing.gpsLng}
                  </a>
                </div>
              )}
            </div>

            {selected.trackingNumber && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>{t('admin.trackingSection')}</h4>
                <div style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa fa-truck" /> {selected.trackingNumber}
                </div>
              </div>
            )}
            {selected.cancelReason && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>{t('admin.cancellationReason')}</h4>
                <div style={{ color: '#fca5a5', fontSize: 14, background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6 }}>{selected.cancelReason}</div>
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>{t('admin.itemsSection')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.isArray(selected.items) && selected.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontSize: 14, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span>{item.nameAr || item.name} <span style={{ color: 'var(--text-secondary)' }}>x{item.qty || 1}</span></span>
                    <span style={{ color: 'var(--purple-light)', fontWeight: 600 }}>EGP {item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--purple-light)', fontSize: 18, fontWeight: 700 }}>
                <span>{t('admin.total')}</span>
                <span>EGP {Number(selected.total || 0).toLocaleString()}</span>
              </div>
            </div>

            <button onClick={() => setSelected(null)} style={{
              width: '100%', marginTop: 20, padding: '10px 0',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
            }}>
              {t('admin.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
