import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../context/I18nContext'
import { ToastProvider } from '../../components/Toast'
import { getOrders } from '../../utils/siteData'

const sidebarWidth = 240



function AdminLayout() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    getOrders().then(orders => {
      setPendingCount(orders.filter(o => o.status === 'Pending').length)
    }).catch(() => {})
  }, [])

  const navItems = [
    { path: '/admin', label: t('admin.dashboard'), icon: 'fa-tachometer', exact: true },
    { path: '/admin/products', label: t('admin.products'), icon: 'fa-cube' },
    { path: '/admin/orders', label: t('admin.orders'), icon: 'fa-shopping-cart' },
    { path: '/admin/blog', label: t('admin.blog'), icon: 'fa-pencil-square-o' },
    { path: '/admin/coupons', label: t('admin.coupons'), icon: 'fa-tags' },
    { path: '/admin/gift-cards', label: t('admin.giftCards', 'Gift Cards'), icon: 'fa-gift' },
    { path: '/admin/site-settings', label: t('admin.siteSettings'), icon: 'fa-cog' },
    { path: '/admin/colors', label: t('admin.colors'), icon: 'fa-paint-brush' },
    { path: '/admin/social', label: t('admin.socialLinks'), icon: 'fa-share-alt' },
    { path: '/admin/contact-messages', label: t('admin.contactMessages'), icon: 'fa-envelope' },
  ]

  useEffect(() => {
    if (loading) return
    if (!user && location.pathname !== '/admin/login') {
      navigate('/admin/login', { replace: true })
    }
    if (user && !isAdmin) {
      navigate('/login', { replace: true })
    }
  }, [user, isAdmin, location.pathname, navigate, loading])

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const handleLogout = () => {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  if (loading) return null
  if (!user && location.pathname !== '/admin/login') return null

  return (
    <ToastProvider>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <aside style={{
        width: sidebarWidth,
        background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-glass)',
        }}>
          <Link to="/" style={{
            color: 'var(--purple)',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            letterSpacing: 1,
          }}>
            SHADOW ANIME
          </Link>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>{t('admin.adminPanel')}</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 20px',
                  color: active ? 'var(--purple)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(139,92,246,0.08)' : 'transparent',
                  borderRight: active ? '2px solid #8b5cf6' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <i className={`fa ${item.icon}`} style={{ width: 18, textAlign: 'center', fontSize: 15 }} />
                {item.label}
                {item.path === '/admin/orders' && pendingCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--rose)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, lineHeight: 1.3 }}>{pendingCount}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-glass)',
        }}>
          {user && (
            <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{user.email}</div>
            </div>
          )}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', marginBottom: 8,
            border: '1px solid var(--border-glass)', borderRadius: 6,
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            textDecoration: 'none', width: '100%', boxSizing: 'border-box',
          }}>
            <i className="fa fa-external-link" /> View Site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              background: 'rgba(239,68,68,0.1)',
              color: 'var(--rose)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <i className="fa fa-sign-out" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        padding: 32,
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
    </ToastProvider>
  )
}

export default AdminLayout
