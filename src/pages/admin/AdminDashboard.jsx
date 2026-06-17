import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getProducts, getOrders, getBlogPosts } from '../../supabase/data'
import { getSiteSettings } from '../../supabase/data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const pageTitle = { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }
const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }

const gradientMap = {
  'Total Products': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'Total Orders': 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'Total Revenue': 'linear-gradient(135deg, #f59e0b, #ef4444)',
  'Total Blog Posts': 'linear-gradient(135deg, #22c55e, #06b6d4)',
}

const COLORS = { Pending: '#f59e0b', Packing: '#3b82f6', Shipped: 'var(--purple)', Delivered: '#22c55e', Rejected: 'var(--rose)' }

function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, blog: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [settings, setSettings] = useState({ currency: 'EGP' })
  const [monthlyData, setMonthlyData] = useState([])
  const { t } = useI18n()
  const [statusData, setStatusData] = useState([])

  useEffect(() => {
    Promise.all([
      getProducts(),
      getOrders(),
      getBlogPosts(),
      getSiteSettings(),
    ]).then(([products, orders, blog, settings]) => {
      const revenue = orders.filter((o) => o.status === 'Delivered').reduce((sum, o) => sum + Number(o.total || 0), 0)
      const pending = orders.filter(o => o.status === 'Pending').length
      const delivered = orders.filter(o => o.status === 'Delivered').length
      const thisMonth = new Date().toISOString().slice(0, 7)
      const monthRevenue = orders.filter(o => o.date && o.date.slice(0, 7) === thisMonth).reduce((sum, o) => sum + Number(o.total || 0), 0)

      setStats({ products: products.length, orders: orders.length, revenue, blog: blog.length, pending, delivered, monthRevenue })
      setRecentOrders(orders.slice(-5).reverse())
      if (settings) setSettings(prev => ({ ...prev, ...settings }))

      const months = {}
      orders.forEach(o => {
        if (o.date) {
          const m = o.date.split('/').length === 3 ? o.date.split('/')[1] + '/' + o.date.split('/')[2] : o.date.slice(0, 7)
          months[m] = (months[m] || 0) + Number(o.total || 0)
        }
      })
      setMonthlyData(Object.entries(months).slice(-6).map(([month, total]) => ({ month, total })))

      const statusCounts = {}
      orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1 })
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })))
    }).catch(() => {
      setStats({ products: 0, orders: 0, revenue: 0, blog: 0 })
    })
  }, [])

  const currency = settings.currency || 'EGP'

  const cards = [
    { label: t('admin.totalProducts'), value: stats.products, link: '/admin/products' },
    { label: t('admin.totalOrders'), value: stats.orders, link: '/admin/orders' },
    { label: t('admin.totalRevenue'), value: `${currency} ${stats.revenue.toLocaleString()}`, link: '/admin/orders' },
    { label: t('admin.totalPosts'), value: stats.blog, link: '/admin/blog' },
  ]

  return (
    <div>
      <h1 style={pageTitle}>{t('admin.dashboard')}</h1>

      <div style={cardGrid}>
        {cards.map((card) => (
          <Link to={card.link} key={card.label} style={{
            background: gradientMap[card.label], borderRadius: 12, padding: '24px 20px',
            color: '#fff', textDecoration: 'none', display: 'block',
          }}>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{card.value}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.pendingOrders', 'Pending Orders')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{stats.pending || 0}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.thisMonth', 'This Month')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple-light)' }}>{currency} {stats.monthRevenue?.toLocaleString() || '0'}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '14px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('admin.deliveredOrders', 'Delivered')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{stats.delivered || 0}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
          <i className="fa fa-plus-circle" style={{ color: 'var(--purple)' }} /> Add Product
        </Link>
        <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
          <i className="fa fa-shopping-cart" style={{ color: '#3b82f6' }} /> View Orders
        </Link>
        <Link to="/admin/blog" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
          <i className="fa fa-pencil-square-o" style={{ color: '#22c55e' }} /> New Post
        </Link>
        <Link to="/admin/coupons" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
          <i className="fa fa-tag" style={{ color: '#f59e0b' }} /> New Coupon
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>{t('admin.monthlyRevenue')}</h3>
          {monthlyData.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 20 }}>{t('admin.noData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>{t('admin.orderStatus')}</h3>
          {statusData.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 20 }}>{t('admin.noOrders')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name] || 'var(--text-muted)'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 12, padding: 20 }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: '0 0 16px 0' }}>{t('admin.recentOrders')}</h2>
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{t('admin.noOrders')}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>{t('admin.orderId')}</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>{t('admin.customer')}</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>{t('admin.total')}</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>{t('admin.status')}</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => {
                const colors = {
                  Delivered: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
                  Rejected: { bg: 'rgba(239,68,68,0.15)', text: 'var(--rose)' },
                  Packing: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
                  Shipped: { bg: 'rgba(139,92,246,0.15)', text: 'var(--purple)' },
                }
                const c = colors[o.status] || { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' }
                return (
                  <tr key={o.id} style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px 12px' }}>#{o.id}</td>
                    <td style={{ padding: '10px 12px' }}>{o.customerName || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{currency} {Number(o.total || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text }}>{o.status || 'Pending'}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{o.date || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
