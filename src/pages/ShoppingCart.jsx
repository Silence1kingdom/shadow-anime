import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import { getCartItems, getCoupons, updateCartItem as supabaseUpdateCartItem, removeCartItem as supabaseRemoveCartItem, getSiteSettings } from '../utils/siteData'

const defaultItems = [
  { id: 1, img: '/img/products/anime-tee-1.jpg', name: 'Tanjiro Kamado Tee', price: 520, qty: 1 },
  { id: 2, img: '/img/products/anime-tee-2.jpg', name: 'Eren Yeager Tee', price: 450, qty: 2 },
]

function ShoppingCart() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [items, setItems] = useState(defaultItems)
  const [removing, setRemoving] = useState(new Set())
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponType, setCouponType] = useState('percentage')
  const [couponMsg, setCouponMsg] = useState('')
  const [freeThreshold, setFreeThreshold] = useState(1000)

  useEffect(() => {
    getSiteSettings().then(s => {
      if (s.freeShippingThreshold) setFreeThreshold(Number(s.freeShippingThreshold))
    })
  }, [])

  useEffect(() => {
    if (user) {
      getCartItems(user.uid).then(data => {
        if (data.length > 0) {
          setItems(data.map(item => ({
            id: item.product_id,
            cartItemId: item.id,
            img: item.products?.image || item.products?.img || '',
            image: item.products?.image || item.products?.img || '',
            name: item.products?.name || '',
            nameAr: item.products?.nameAr || '',
            price: Number(item.products?.price || 0),
            qty: item.quantity || 1,
          })))
        }
      })
    }
  }, [user])

  const updateQty = (id, delta) => {
    setItems(prev => {
      const next = prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
      const item = next.find(i => i.id === id)
      if (item && item.cartItemId) {
        supabaseUpdateCartItem(item.cartItemId, item.qty)
      }
      return next
    })
  }

  const removeItem = (id) => {
    setRemoving(prev => new Set(prev).add(id))
    const item = items.find(i => i.id === id)
    if (item && item.cartItemId) {
      supabaseRemoveCartItem(item.cartItemId)
    }
    setTimeout(() => {
      setRemoving(prev => { const next = new Set(prev); next.delete(id); return next })
      setItems(prev => prev.filter(item => item.id !== id))
    }, 350)
  }

  const applyCoupon = async (e) => {
    e.preventDefault()
    const coupons = await getCoupons()
    const c = coupons.find(c => c.code === coupon.trim().toUpperCase())
    if (c) {
      const discValue = Number(c.value) || 0
      const type = c.type || 'percentage'
      setDiscount(discValue)
      setCouponType(type)
      setCouponMsg(`✅ Coupon applied! ${discValue}${type === 'percentage' ? '%' : ' EGP'} off`)
      try {
        localStorage.setItem('coupon_discount', String(discValue))
        localStorage.setItem('coupon_discount_type', type)
        localStorage.setItem('coupon_applied_code', c.code)
      } catch {}
    } else {
      setDiscount(0)
      setCouponType('percentage')
      setCouponMsg('❌ Invalid coupon code')
      try {
        localStorage.removeItem('coupon_discount')
        localStorage.removeItem('coupon_discount_type')
        localStorage.removeItem('coupon_applied_code')
      } catch {}
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)
  const discountAmt = discount > 0 ? (couponType === 'percentage' ? subtotal * (discount / 100) : discount) : 0
  const shipping = subtotal > freeThreshold ? 0 : 50
  const total = subtotal - discountAmt + shipping

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('cart.title')} ({items.length})</h4>
                <div className="breadcrumb__links">
                  <Link to="/">{t('nav.home')}</Link>
                  <Link to="/shop">{t('nav.shop')}</Link>
                  <span>{t('cart.title')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shopping-cart spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {items.length === 0 ? (
                <div className="shopping__cart__empty" style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <i className="fa fa-shopping-cart" style={{ fontSize: '64px', color: 'var(--text-muted)', marginBottom: '20px' }}></i>
                  <h3 style={{ marginBottom: '15px' }}>{t('cart.empty')}</h3>
                  <p style={{ marginBottom: '25px' }}>{t('cart.emptyMsg')}</p>
                  <Link to="/shop" className="primary-btn">{t('cart.startShopping')}</Link>
                </div>
              ) : (
                <>
                  <div className="shopping__cart__table">
                    <table>
                      <thead>
                        <tr>
                          <th>{t('cart.product')}</th>
                          <th>{t('cart.quantity')}</th>
                          <th>{t('cart.total')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id} style={{
                            transition: 'all 0.35s ease',
                            opacity: removing.has(item.id) ? 0 : 1,
                            transform: removing.has(item.id) ? 'translateX(60px)' : 'translateX(0)',
                            pointerEvents: removing.has(item.id) ? 'none' : 'auto',
                          }}>
                            <td className="product__cart__item">
                              <div className="product__cart__item__pic">
                                <img src={item.image || item.img} alt={item.name} width="90" loading="lazy" decoding="async" style={{ borderRadius: '8px' }} />
                              </div>
                              <div className="product__cart__item__text">
                                <h6>{item.nameAr || item.name}</h6>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{item.name}</p>
                                <h5>EGP {item.price}</h5>
                              </div>
                            </td>
                            <td className="quantity__item">
                              <div className="quantity">
                                <div className="pro-qty-2">
                                  <span className="fa fa-minus dec qtybtn" onClick={() => updateQty(item.id, -1)}></span>
                                  <input type="text" value={item.qty} readOnly />
                                  <span className="fa fa-plus inc qtybtn" onClick={() => updateQty(item.id, 1)}></span>
                                </div>
                              </div>
                            </td>
                            <td className="cart__price" style={{ fontWeight: 700, color: 'var(--cyan)' }}>EGP {item.price * item.qty}</td>
                            <td className="cart__close" onClick={() => removeItem(item.id)}><span className="icon_close"></span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <div className="continue__btn">
                        <Link to="/shop">{t('cart.continue')}</Link>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <div className="continue__btn update__btn">
                        <span onClick={() => user && getCartItems(user.uid).then(data => {
                          setItems(data.length > 0 ? data.map(item => ({
                            id: item.product_id,
                            cartItemId: item.id,
                            img: item.products?.image || item.products?.img || '',
                            image: item.products?.image || item.products?.img || '',
                            name: item.products?.name || '',
                            nameAr: item.products?.nameAr || '',
                            price: Number(item.products?.price || 0),
                            qty: item.quantity || 1,
                          })) : defaultItems)
                        })} style={{ cursor: 'pointer' }}><i className="fa fa-refresh"></i> {t('cart.refresh')}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="col-lg-4">
              <div className="cart__discount">
                <h6><i className="fa fa-tag" style={{ marginRight: 8 }}></i> {t('cart.coupon')}</h6>
                <form onSubmit={applyCoupon}>
                  <input type="text" placeholder={t('cart.couponPlaceholder', 'Enter coupon')} value={coupon} onChange={e => setCoupon(e.target.value)} />
                  <button type="submit">{t('cart.apply')}</button>
                </form>
                {couponMsg && (
                  <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: discount > 0 ? '#22c55e' : 'var(--rose)' }}>
                    {couponMsg}
                  </p>
                )}
                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  Try: ANIME10 or SHADOW20
                </p>
              </div>
              <div className="cart__total">
                <h6>{t('cart.cartTotal', 'Cart total')}</h6>
                <ul>
                  <li>{t('cart.subtotal')} <span>EGP {subtotal}</span></li>
                  {discount > 0 && <li>Discount ({discount}%) <span style={{ color: '#22c55e' }}>-EGP {discountAmt}</span></li>}
                  <li>{t('cart.shipping')} <span>{shipping === 0 ? t('cart.free') : `EGP ${shipping}`}</span></li>
                  <li style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 12, marginTop: 8 }}>
                    <strong>{t('cart.total')}</strong> <span style={{ fontSize: 22, color: 'var(--purple-light)' }}>EGP {total}</span>
                  </li>
                </ul>
                <Link to="/checkout" state={{ fromCart: true }} className="primary-btn" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                  {t('cart.proceed')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ShoppingCart
