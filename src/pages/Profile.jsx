import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { useWishlist } from '../context/WishlistContext'
import { getOrdersByUser, getCartItems, getProfile, updateProfile as supabaseUpdateProfile, getSiteSettings, updateOrderStatus } from '../utils/siteData'

const statusColors = {
  Pending: '#f59e0b',
  Packing: '#3b82f6',
  Shipped: 'var(--purple)',
  Delivered: '#22c55e',
  Rejected: 'var(--rose)',
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  borderRadius: 12,
  padding: 24,
  backdropFilter: 'blur(12px)',
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const btnStyle = {
  padding: '10px 24px',
  border: 'none',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
}

function Profile() {
  const { user } = useAuth()
  const { t } = useI18n()

  const tabs = [
    { id: 'profile', label: t('profile.info', 'Profile Info'), icon: 'fa-user' },
    { id: 'orders', label: t('profile.myOrders', 'My Orders'), icon: 'fa-shopping-bag' },
    { id: 'cart', label: t('profile.myCart', 'My Cart'), icon: 'fa-shopping-cart' },
    { id: 'wishlist', label: t('wishlist.title', 'Wishlist'), icon: 'fa-heart' },
  ]
  const { wishlist, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saved, setSaved] = useState(false)

  const [orders, setOrders] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [freeThreshold, setFreeThreshold] = useState(1000)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    getSiteSettings().then(s => {
      if (s.freeShippingThreshold) setFreeThreshold(Number(s.freeShippingThreshold))
    })
    getProfile(user.uid).then(profile => {
      if (profile) {
        if (profile.phone) setPhone(profile.phone)
        if (profile.address) setAddress(profile.address)
      }
    }).catch(() => {})
    getOrdersByUser(user.uid).then(setOrders).catch(() => {})
    getCartItems(user.uid).then(data => {
      setCartItems(data.map(item => ({
        id: item.product_id,
        img: item.products?.image || item.products?.img || '',
        image: item.products?.image || item.products?.img || '',
        name: item.products?.name || '',
        nameAr: item.products?.nameAr || '',
        price: Number(item.products?.price || 0),
        qty: item.quantity || 1,
      })))
    }).catch(() => {})
  }, [user, navigate])

  const saveProfile = async () => {
    if (user) {
      await supabaseUpdateProfile(user.uid, { phone, address }).catch(() => {})
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const cartSubtotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0)
  const cartShipping = cartSubtotal > freeThreshold ? 0 : 50
  const cartTotal = cartSubtotal + cartShipping

  const tabLabel = tabs.find(t => t.id === activeTab)?.label || t('profile.title', 'Profile')

  if (!user) return null

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('profile.title', 'My Profile')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">{t('nav.home')}</Link>
                  <span>{t('profile.title', 'Profile')}</span>
                  <span style={{ color: 'var(--purple)' }}>/ {tabLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spad" style={{ paddingTop: 30 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 24,
                  border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  background: activeTab === tab.id ? 'var(--purple)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#cbd5e1',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <i className={`fa ${tab.icon}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {user.displayName
                      ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: 4, fontSize: 20, fontWeight: 700 }}>{user.displayName || 'User'}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>{user.email}</p>
                    {user.metadata?.creationTime && (
                      <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                        {t('profile.memberSince', 'Member since')} {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{t('profile.edit', 'Edit Profile')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>{t('profile.phone', 'Phone')}</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>{t('profile.address', 'Address')}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="123 Main St, Cairo, Egypt"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={saveProfile} style={btnStyle}
                      onMouseEnter={e => e.target.style.opacity = '0.85'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    >
                      {t('profile.saveChanges', 'Save Changes')}
                    </button>
                    {saved && (
                      <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
                        <i className="fa fa-check-circle" style={{ marginRight: 4 }} />
                        {t('profile.saved', 'Saved!')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div style={cardStyle}>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <i className="fa fa-shopping-bag" style={{ fontSize: 56, color: '#475569', marginBottom: 16 }} />
                  <h3 style={{ marginBottom: 8, fontWeight: 600 }}>{t('profile.noOrders', 'No orders yet')}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{t('profile.noOrdersMsg', "You haven't placed any orders yet.")}</p>
                  <Link to="/shop" style={btnStyle}>{t('profile.startShopping', 'Start Shopping')}</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {orders.map((o) => (
                    <div key={o.id} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 12,
                      padding: 20,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('profile.orderNumber', 'Order #')}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 700, marginLeft: 6 }}>{o.id}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{o.date || '-'}</span>
                          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--purple-light)' }}>EGP {Number(o.total || 0).toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                        {['Pending', 'Packing', 'Shipped', 'Delivered'].map((step, idx) => {
                          const currentIdx = ['Pending', 'Packing', 'Shipped', 'Delivered'].indexOf(o.status)
                          const isRejected = o.status === 'Rejected'
                          const isActive = idx <= currentIdx && !isRejected
                          const isCurrent = idx === currentIdx && !isRejected
                          return (
                            <div key={step} style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                              borderRadius: 20,
                              background: isActive ? `${statusColors[step]}26` : 'rgba(255,255,255,0.03)',
                              border: isCurrent ? `2px solid ${statusColors[step]}` : '1px solid var(--border-glass)',
                              color: isActive ? statusColors[step] : 'var(--text-muted)',
                              fontSize: 12, fontWeight: 600,
                            }}>
                              {idx === 0 && <i className="fa fa-clock-o" />}
                              {idx === 1 && <i className="fa fa-cube" />}
                              {idx === 2 && <i className="fa fa-truck" />}
                              {idx === 3 && <i className="fa fa-check-circle" />}
                              {step}
                              {isCurrent && <i className="fa fa-chevron-right" style={{ fontSize: 10 }} />}
                            </div>
                          )
                        })}
                        {o.status === 'Rejected' && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                            borderRadius: 20,
                            background: `${statusColors.Rejected}26`,
                            border: `2px solid ${statusColors.Rejected}`,
                            color: statusColors.Rejected,
                            fontSize: 12, fontWeight: 600,
                          }}>
                            <i className="fa fa-times-circle" />
                            {t('admin.rejected', 'Rejected')}
                          </div>
                        )}
                      </div>

                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t('profile.items', 'Items: ')}</span>
                        {Array.isArray(o.items)
                          ? o.items.map(item => (item.nameAr || item.name) + ' x' + (item.qty || 1)).join(', ')
                          : o.items || '-'}
                      </div>

                      {o.paymentMethod && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{t('profile.payment', 'Payment:')}</strong> {o.paymentMethod}
                        </div>
                      )}
                      {o.billing?.gpsLat && o.billing?.gpsLng && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                          <i className="fa fa-map-marker" style={{ marginRight: 4, color: 'var(--purple-light)' }} />
                          <a href={`https://www.google.com/maps?q=${o.billing.gpsLat},${o.billing.gpsLng}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--purple)', textDecoration: 'underline', fontSize: 13 }}>
                            {o.billing.gpsLat}, {o.billing.gpsLng}
                          </a>
                        </div>
                      )}
                      {(o.status === 'Pending' || o.status === 'Packing') && (
                        <button onClick={async () => {
                          const reason = prompt('Why are you cancelling? (optional)')
                          if (reason === null) return
                          await updateOrderStatus(o.id, 'Rejected').catch(() => {})
                          setOrders(orders.map(ord => ord.id === o.id ? { ...ord, status: 'Rejected', cancelReason: reason || '' } : ord))
                        }} style={{
                          marginTop: 12, padding: '8px 16px', border: '1px solid #ef4444', borderRadius: 6,
                          background: 'transparent', color: 'var(--rose)', fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef444420' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <i className="fa fa-times-circle" style={{ marginRight: 6 }} />{t('profile.cancelOrder', 'Cancel Order')}
                        </button>
                      )}
                      {o.cancelReason && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: 13 }}>
                          <strong>{t('profile.cancelReason', 'Cancellation reason:')}</strong> {o.cancelReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div style={cardStyle}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <i className="fa fa-shopping-cart" style={{ fontSize: 56, color: '#475569', marginBottom: 16 }} />
                  <h3 style={{ marginBottom: 8, fontWeight: 600 }}>{t('cart.empty', 'Your cart is empty')}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{t('cart.emptyMsg', "Looks like you haven't added anything yet.")}</p>
                  <Link to="/shop" style={btnStyle}>{t('profile.browseProducts', 'Browse Products')}</Link>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 500 }}>
                      <thead>
                        <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
                          <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('cart.product', 'Product')}</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('cart.quantity', 'Qty')}</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('cart.price', 'Price')}</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('cart.total', 'Total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item, i) => (
                          <tr key={item.id} style={{
                            color: 'var(--text-primary)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                          }}>
                            <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img src={item.image || item.img} alt={item.name} loading="lazy" decoding="async" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                              <div><span>{item.nameAr || item.name}</span><br /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name}</span></div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>{item.qty}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>EGP {item.price}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>EGP {item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{
                    marginTop: 20,
                    padding: '16px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: 10,
                    border: '1px solid var(--border-glass)',
                    maxWidth: 360,
                    marginLeft: 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span>{t('cart.subtotal', 'Subtotal')}</span>
                      <span>EGP {cartSubtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span>{t('cart.shipping', 'Shipping')}</span>
                      <span>{cartShipping === 0 ? t('cart.free', 'FREE') : `EGP ${cartShipping}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'var(--purple-light)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
                      <span>{t('cart.total', 'Total')}</span>
                      <span>EGP {cartTotal}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Link to="/shopping-cart" style={btnStyle}>{t('profile.editCart', 'Edit Cart')}</Link>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div style={cardStyle}>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <i className="fa fa-heart-o" style={{ fontSize: 56, color: '#475569', marginBottom: 16 }} />
                  <h3 style={{ marginBottom: 8, fontWeight: 600 }}>{t('wishlist.empty', 'Your wishlist is empty')}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{t('wishlist.emptyMsg', 'Save your favorite items here.')}</p>
                  <Link to="/shop" style={btnStyle}>{t('wishlist.browse', 'Explore Products')}</Link>
                </div>
              ) : (
                <div className="row">
                  {wishlist.map(p => (
                    <div key={p.id} className="col-lg-4 col-md-6 col-sm-6">
                      <div
                        className="product__item"
                        style={{ transition: 'all 0.3s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="product__item__pic" style={{ backgroundImage: `url(${p.image || p.img})`, position: 'relative' }}>
                          <button
                            onClick={() => toggleWishlist(p)}
                            style={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(0,0,0,0.5)',
                              color: '#e53637',
                              fontSize: 16,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(8px)',
                              transition: 'all 0.3s',
                            }}
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                        <div className="product__item__text">
                          <h6>{p.nameAr || p.name}</h6>
                          <Link to={`/shop-details?id=${p.id}`} state={{ product: p }} className="add-cart">{t('product.details', '+ View Details')}</Link>
                          <div className="rating">
                            {[1, 2, 3, 4, 5].map(r => (
                              <i key={r} className={`fa fa-star${r > 3 ? '-o' : ''}`} />
                            ))}
                          </div>
                          <h5>EGP {p.price}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Profile
