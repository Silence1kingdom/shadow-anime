import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../supabase/data'

const statusFlow = ['Pending', 'Packing', 'Shipped', 'Delivered']
const statusColors = { Pending: '#f59e0b', Packing: '#3b82f6', Shipped: 'var(--purple)', Delivered: '#22c55e', Rejected: 'var(--rose)' }
const statusIcons = { Pending: 'fa-clock-o', Packing: 'fa-cube', Shipped: 'fa-truck', Delivered: 'fa-check-circle', Rejected: 'fa-times-circle' }

function Tracking() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const track = async (e) => {
    e.preventDefault()
    if (!orderId.trim()) return
    setNotFound(false)
    setOrder(null)
    try {
      const orders = await getOrders()
      const found = orders.find(o => String(o.id) === orderId.trim())
      if (found) {
        setOrder(found)
      } else {
        setNotFound(true)
      }
    } catch { setNotFound(true) }
  }

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>Track Order</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <span>Track Order</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spad">
        <div className="container">
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 30,
            }}>
              <i className="fa fa-search" style={{ fontSize: 40, color: 'var(--purple)', marginBottom: 16, display: 'block' }} />
              <h2 style={{ color: 'var(--text-primary)', fontSize: 22, marginBottom: 8 }}>Track Your Order</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Enter your order number to check its status.</p>
              <form onSubmit={track} style={{ display: 'flex', gap: 10 }}>
                <input value={orderId} onChange={e => setOrderId(e.target.value)}
                  placeholder="e.g. 1712345678901"
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'var(--bg-glass)', color: 'var(--text-primary)',
                    fontSize: 14, outline: 'none',
                  }} />
                <button type="submit" style={{
                  padding: '12px 24px', border: 'none', borderRadius: 8,
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  <i className="fa fa-search" style={{ marginRight: 6 }} />Track
                </button>
              </form>
            </div>

            {notFound && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12, padding: 20, textAlign: 'center',
              }}>
                <i className="fa fa-exclamation-circle" style={{ fontSize: 24, color: 'var(--rose)', marginBottom: 8, display: 'block' }} />
                <p style={{ color: 'var(--rose)', fontSize: 14, margin: 0 }}>Order not found. Please check your order number.</p>
              </div>
            )}

            {order && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                borderRadius: 16, padding: 28,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Order #</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, marginLeft: 6 }}>{order.id}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{order.date}</span>
                </div>

                <div style={{ position: 'relative', marginBottom: 28 }}>
                  <div style={{
                    position: 'absolute', left: 15, top: 0, bottom: 0, width: 2,
                    background: 'var(--border-glass)',
                  }} />
                  {statusFlow.map((step, idx) => {
                    const currentIdx = statusFlow.indexOf(order.status)
                    const isRejected = order.status === 'Rejected'
                    const done = idx <= currentIdx && !isRejected
                    const active = idx === currentIdx && !isRejected
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 20, position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: done ? statusColors[step] : 'rgba(255,255,255,0.04)',
                          border: active ? `3px solid ${statusColors[step]}` : '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: done ? '#fff' : 'var(--text-muted)', fontSize: 14, flexShrink: 0,
                          boxShadow: active ? `0 0 20px ${statusColors[step]}40` : 'none',
                        }}>
                          <i className={`fa ${statusIcons[step]}`} />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                          <div style={{ color: done ? statusColors[step] : 'var(--text-muted)', fontWeight: 700, fontSize: 15 }}>{step}</div>
                          {active && (
                            <div style={{
                              marginTop: 4, padding: '4px 12px', borderRadius: 4,
                              background: `${statusColors[step]}20`, color: statusColors[step],
                              fontSize: 12, fontWeight: 600, display: 'inline-block',
                            }}>Current</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {order.status === 'Rejected' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--rose)', border: '3px solid #ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14, flexShrink: 0,
                      }}>
                        <i className="fa fa-times-circle" />
                      </div>
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ color: 'var(--rose)', fontWeight: 700, fontSize: 15 }}>Rejected</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 16 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Items: </strong>
                    {Array.isArray(order.items) ? order.items.map(item => `${item.nameAr || item.name} x${item.qty || 1}`).join(', ') : order.items}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Total: </strong>EGP {Number(order.total || 0).toLocaleString()}
                  </div>
                  {order.paymentMethod && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Payment: </strong>{order.paymentMethod}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Tracking
