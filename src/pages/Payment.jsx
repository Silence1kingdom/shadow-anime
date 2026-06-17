import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCartItems, getSiteSettings, getGiftCards, updateGiftCard, addOrder } from '../utils/siteData'
import emailjs from '@emailjs/browser'

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)', color: 'var(--text-primary)',
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
}

const labelStyle = { display: 'block', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 6 }

const paymentMethods = [
  { id: 'credit', icon: 'fa-credit-card', label: 'Credit Card', color: 'var(--purple)' },
  { id: 'paypal', icon: 'fa-paypal', label: 'PayPal', color: '#0070ba' },
  { id: 'vodafone', icon: 'fa-mobile', label: 'Vodafone Cash', color: '#e53637' },
  { id: 'etisalat', icon: 'fa-mobile', label: 'Etisalat Cash', color: '#7c3aed' },
  { id: 'orange', icon: 'fa-mobile', label: 'Orange Cash', color: '#ff6b00' },
  { id: 'we', icon: 'fa-mobile', label: 'We Cash', color: '#06b6d4' },
]

function Payment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const orderData = location.state?.order
  const redirectRef = useRef(null)

  useEffect(() => {
    return () => {
      if (redirectRef.current) clearTimeout(redirectRef.current)
    }
  }, [])

  const [method, setMethod] = useState('credit')
  const [cardNum, setCardNum] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [transId, setTransId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [billing, setBilling] = useState({})
  const [adminWhatsapp, setAdminWhatsapp] = useState('+201000000000')
  const [freeThreshold, setFreeThreshold] = useState(1000)
  const [giftCode, setGiftCode] = useState('')
  const [giftDiscount, setGiftDiscount] = useState(0)
  const [giftMsg, setGiftMsg] = useState('')

  const fromCart = location.state?.fromCart
  const orderId = orderData?.id

  useEffect(() => {
    if (!user) return
    try {
      const saved = localStorage.getItem('billing_info')
      if (saved) setBilling(JSON.parse(saved))
    } catch {}
    getSiteSettings().then(s => {
      if (s.whatsapp) setAdminWhatsapp(s.whatsapp)
      if (s.freeShippingThreshold) setFreeThreshold(Number(s.freeShippingThreshold))
    })
    if (fromCart) {
      getCartItems(user.uid).then(data => {
        const items = data.map(item => ({
          id: item.product_id,
          img: item.products?.image || item.products?.img || '',
          image: item.products?.image || item.products?.img || '',
          name: item.products?.name || '',
          nameAr: item.products?.nameAr || '',
          price: Number(item.products?.price || 0),
          qty: item.quantity || 1,
        }))
        setCartItems(items)
        setSubtotal(items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0))
      })
    } else if (orderData) {
      setCartItems(orderData.items || [])
      setSubtotal(orderData.subtotal || orderData.total || 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fromCart, orderId])

  const formatCardNum = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const methodLabel = (id) => {
    const m = paymentMethods.find(p => p.id === id)
    return m ? m.label : id
  }

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')

    if (method === 'credit') {
      if (cardNum.replace(/\s/g, '').length < 16) { setError('Enter a valid card number'); return }
      if (!cardName.trim()) { setError('Enter cardholder name'); return }
      if (expiry.length < 5) { setError('Enter expiry date'); return }
      if (cvv.length < 3) { setError('Enter CVV'); return }
    }
    if (['vodafone', 'etisalat', 'orange', 'we'].includes(method)) {
      if (!transId.trim()) { setError('Enter transaction ID'); return }
    }

    setProcessing(true)

    const couponDiscount = (() => { try { return Number(localStorage.getItem('coupon_discount')) || 0 } catch { return 0 } })()
    const couponType = (() => { try { return localStorage.getItem('coupon_discount_type') || 'percentage' } catch { return 'percentage' } })()
    const shippingCost = subtotal > freeThreshold ? 0 : 50
    const afterCoupon = couponType === 'percentage'
      ? Math.round(subtotal * (100 - couponDiscount) / 100)
      : Math.max(0, subtotal - couponDiscount)
    const finalTotal = afterCoupon + shippingCost - giftDiscount

    const order = {
      user_id: user?.id,
      customerEmail: user?.email || billing.email || '',
      customerName: user?.displayName || ([billing.firstName, billing.lastName].filter(Boolean).join(' ')) || '',
      items: cartItems,
      total: finalTotal,
      subtotal,
      shipping: shippingCost,
      couponDiscount,
      status: 'Pending',
      paymentMethod: methodLabel(method),
      paymentId: ['vodafone', 'etisalat', 'orange', 'we'].includes(method) ? transId : '',
      giftCode: giftDiscount > 0 ? giftCode.toUpperCase() : '',
      giftDiscount: giftDiscount > 0 ? giftDiscount : 0,
      date: new Date().toLocaleDateString(),
      billing: {
        address: billing.address,
        apartment: billing.apartment,
        phone: billing.phone,
        gpsLat: billing.gpsLat !== undefined && billing.gpsLat !== '' ? billing.gpsLat : '',
        gpsLng: billing.gpsLng !== undefined && billing.gpsLng !== '' ? billing.gpsLng : '',
      },
    }

    const created = await addOrder(order)
    try { localStorage.removeItem('coupon_discount') } catch {}
    try { localStorage.removeItem('coupon_applied_code') } catch {}

    if (giftDiscount > 0) {
      const cards = await getGiftCards()
      const card = cards.find(c => c.code === giftCode.trim().toUpperCase())
      if (card) {
        const remaining = Math.max(0, card.remaining - giftDiscount)
        await updateGiftCard(card.id, {
          remaining,
          status: remaining <= 0 ? 'consumed' : 'active',
          used_by: user?.email || billing.email || '',
          used_at: new Date().toISOString(),
        })
      }
    }

    const hasGps = billing.gpsLat !== undefined && billing.gpsLat !== '' && billing.gpsLng !== undefined && billing.gpsLng !== ''
    const gpsPart = hasGps
      ? `\n🌐 *GPS:* https://www.google.com/maps?q=${billing.gpsLat},${billing.gpsLng}` : ''

    const msg = encodeURIComponent(
      `🛒 *New Order #${order.id}*\n` +
      `👤 *Customer:* ${order.customerName || '—'}\n` +
      `📧 *Email:* ${order.customerEmail}\n` +
      `📞 *Phone:* ${billing.phone || '—'}\n` +
      `📍 *Address:* ${billing.address || '—'}${billing.apartment ? ', ' + billing.apartment : ''}${gpsPart}\n` +
      `💳 *Payment:* ${order.paymentMethod}${order.paymentId ? '\n🏷️ *Trans ID:* ' + order.paymentId : ''}\n` +
      `📦 *Items:* ${cartItems.map(i => (i.nameAr || i.name) + ' x' + (i.qty || 1)).join(', ')}\n` +
      `📊 *Subtotal:* EGP ${subtotal}\n` +
      `🚚 *Shipping:* ${shippingCost === 0 ? 'FREE' : 'EGP ' + shippingCost}\n` +
      `💰 *Total:* EGP ${finalTotal}\n` +
      `📅 *Date:* ${order.date}`
    )

    const wa = adminWhatsapp.replace(/[^0-9]/g, '')
    setProcessing(false)
    setDone(true)

    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')

    try {
      emailjs.send(
        'service_yourid', 'template_yourid',
        {
          to_email: order.customerEmail,
          customer_name: order.customerName,
          order_id: order.id,
          order_items: cartItems.map(i => (i.nameAr || i.name) + ' x' + (i.qty || 1)).join(', '),
          order_total: 'EGP ' + finalTotal,
          order_status: 'Pending',
          payment_method: order.paymentMethod,
          shipping_address: billing.address + (billing.apartment ? ', ' + billing.apartment : ''),
          phone: billing.phone || '',
        },
        'user_yourid',
        ).catch(() => { /* email silently fails — WhatsApp still works */ })
    } catch {}

    redirectRef.current = setTimeout(() => navigate('/profile'), 3000)
  }

  if (!user) return <Navigate to="/login" replace />

  const couponDiscount = (() => { try { return Number(localStorage.getItem('coupon_discount')) || 0 } catch { return 0 } })()
  const couponType = (() => { try { return localStorage.getItem('coupon_discount_type') || 'percentage' } catch { return 'percentage' } })()
  const shippingCost = subtotal > freeThreshold ? 0 : 50
  const afterCoupon = couponType === 'percentage'
    ? Math.round(subtotal * (100 - couponDiscount) / 100)
    : Math.max(0, subtotal - couponDiscount)
  const finalTotal = afterCoupon + shippingCost - giftDiscount

  const applyGiftCard = async () => {
    if (!giftCode.trim()) { setGiftMsg('Enter a code'); return }
    try {
      const cards = await getGiftCards()
      const card = cards.find(c => c.code === giftCode.trim().toUpperCase())
      if (!card) { setGiftMsg('Invalid code'); setGiftDiscount(0); return }
      if (card.status !== 'active' || card.remaining <= 0) { setGiftMsg('Already consumed'); setGiftDiscount(0); return }
      const apply = Math.min(card.remaining, finalTotal)
      setGiftDiscount(apply)
      setGiftMsg(`Gift card applied: -EGP ${apply}`)
    } catch { setGiftMsg('Error'); setGiftDiscount(0) }
  }

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>Payment</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <Link to="/checkout">Checkout</Link>
                  <span>Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spad">
        <div className="container">
          {done ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 80, color: '#22c55e', marginBottom: 20 }}>
                <i className="fa fa-check-circle" />
              </div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Order Placed!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: 16 }}>WhatsApp sent to admin for confirmation.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Redirecting to your orders...</p>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-7">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: 12, padding: 28,
                }}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                    <i className="fa fa-credit-card" style={{ marginRight: 10, color: 'var(--purple)' }} />
                    Payment Method
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 24 }}>
                    {paymentMethods.map(m => (
                      <button key={m.id} onClick={() => setMethod(m.id)} style={{
                        padding: '14px 10px', borderRadius: 10,
                        border: method === m.id ? `2px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)',
                        background: method === m.id ? `${m.color}15` : 'rgba(255,255,255,0.02)',
                        color: method === m.id ? m.color : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'center',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}><i className={`fa ${m.icon}`} /></div>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handlePay}>
                    {method === 'credit' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={labelStyle}>Card Number</label>
                          <input style={inputStyle} placeholder="1234 5678 9012 3456" value={cardNum}
                            onChange={e => setCardNum(formatCardNum(e.target.value))} maxLength={19} />
                        </div>
                        <div>
                          <label style={labelStyle}>Cardholder Name</label>
                          <input style={inputStyle} placeholder="John Doe" value={cardName}
                            onChange={e => setCardName(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Expiry Date</label>
                            <input style={inputStyle} placeholder="MM/YY" value={expiry}
                              onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={labelStyle}>CVV</label>
                            <input style={inputStyle} placeholder="123" value={cvv}
                              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} maxLength={3} type="password" />
                          </div>
                        </div>
                      </div>
                    )}

                    {method === 'paypal' && (
                      <div style={{ padding: '20px 0', color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center' }}>
                        <i className="fa fa-paypal" style={{ fontSize: 48, color: '#0070ba', marginBottom: 12, display: 'block' }} />
                        You will be redirected to PayPal to complete your payment of <strong style={{ color: 'var(--text-primary)' }}>EGP {finalTotal}</strong>.
                      </div>
                    )}

                    {['vodafone', 'etisalat', 'orange', 'we'].includes(method) && (
                      <div style={{ padding: '10px 0' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <div style={{ fontSize: 36, marginBottom: 8 }}>
                            {method === 'vodafone' && <span style={{ color: '#e53637' }}><i className="fa fa-mobile" /></span>}
                            {method === 'etisalat' && <span style={{ color: '#7c3aed' }}><i className="fa fa-mobile" /></span>}
                            {method === 'orange' && <span style={{ color: '#ff6b00' }}><i className="fa fa-mobile" /></span>}
                            {method === 'we' && <span style={{ color: '#06b6d4' }}><i className="fa fa-mobile" /></span>}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                            Send <strong style={{ color: 'var(--text-primary)' }}>EGP {finalTotal}</strong> to:
                          </p>
                          <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: '4px 0 12px' }}>{adminWhatsapp}</p>
                        </div>
                        <div>
                          <label style={labelStyle}>Transaction ID</label>
                          <input style={inputStyle} placeholder="Enter transaction ID" value={transId}
                            onChange={e => setTransId(e.target.value)} />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div style={{ color: 'var(--rose)', fontSize: 14, textAlign: 'center', marginTop: 12 }}>
                        <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
                        {error}
                      </div>
                    )}

                    <button type="submit" disabled={processing || cartItems.length === 0} style={{
                      width: '100%', marginTop: 20, padding: '14px 0', border: 'none', borderRadius: 8,
                      background: processing ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                      color: '#fff', fontSize: 16, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      {processing ? (
                        <><i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }} />Processing...</>
                      ) : (
                        <><i className="fa fa-whatsapp" style={{ marginRight: 8 }} />Pay & Send via WhatsApp</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-5">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: 12, padding: 24, position: 'sticky', top: 100,
                }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: 16, marginBottom: 16 }}>
                    <i className="fa fa-shopping-cart" style={{ marginRight: 8, color: 'var(--purple)' }} />
                    Order Summary
                  </h4>
                  {cartItems.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No items in cart.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        {cartItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <img src={item.image || item.img} alt="" loading="lazy" decoding="async" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>{item.nameAr || item.name}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>x{item.qty}</div>
                            </div>
                            <div style={{ color: 'var(--purple-light)', fontWeight: 600, fontSize: 14 }}>EGP {item.price * item.qty}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>
                          <span>Subtotal</span><span>EGP {subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>
                          <span>Shipping</span><span>{subtotal > freeThreshold ? 'FREE' : 'EGP 50'}</span>
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 6, marginBottom: 10 }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                            <input value={giftCode} onChange={e => setGiftCode(e.target.value)} placeholder="Gift card code"
                              style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
                            <button onClick={applyGiftCard} style={{ padding: '8px 14px', border: 'none', borderRadius: 6, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Apply</button>
                          </div>
                          {giftMsg && <div style={{ fontSize: 12, color: giftMsg.includes('applied') ? '#22c55e' : 'var(--rose)' }}>{giftMsg}</div>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--purple-light)', fontSize: 20, fontWeight: 700, borderTop: '1px solid var(--border-glass)', paddingTop: 12, marginTop: 6 }}>
                          <span>Total</span><span>EGP {finalTotal}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Payment
