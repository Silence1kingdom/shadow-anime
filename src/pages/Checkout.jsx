import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { getCartItems, getCoupons } from '../supabase/data'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const modalOverlay = {
  position: 'fixed', inset: 0, zIndex: 99999,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20,
}

const modalContent = {
  background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16, padding: 24, maxWidth: 600, width: '100%',
  maxHeight: '90vh', overflowY: 'auto',
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} /> : null
}

function FlyToMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.5 })
  }, [center, map])
  return null
}

function Checkout() {
  const { t } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [form, setForm] = useState({ firstName: '', lastName: '', address: '', apartment: '', phone: '', email: '', gpsLat: '', gpsLng: '' })
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponType, setCouponType] = useState('percentage')
  const [couponMsg, setCouponMsg] = useState('')
  const [couponApplied, setCouponApplied] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [mapPos, setMapPos] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [reverseAddr, setReverseAddr] = useState('')

  useEffect(() => {
    if (user) {
      getCartItems(user.id).then(data => {
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
        setTotal(items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0))
      })
    }
    if (user?.email) setForm(f => ({ ...f, email: user.email }))
  }, [user])

  const resetMapPos = () => {
    setMapPos(null)
    setReverseAddr('')
  }

  const handleGeoLocate = () => {
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by your browser.', 'error')
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setMapPos([lat, lng])
        reverseGeocode(lat, lng)
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        toast('Could not get location: ' + err.message, 'error')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } },
      )
      const data = await res.json()
      setReverseAddr(data.display_name || `${lat}, ${lng}`)
    } catch {
      setReverseAddr(`${lat}, ${lng}`)
    }
  }

  const confirmLocation = () => {
    if (mapPos) {
      setForm(f => ({
        ...f,
        gpsLat: mapPos[0].toFixed(6),
        gpsLng: mapPos[1].toFixed(6),
        address: reverseAddr || f.address,
      }))
    }
    setShowMap(false)
  }

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('checkout.title')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <Link to="/shop">Shop</Link>
                  <span>{t('checkout.title')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="checkout spad">
        <div className="container">
          <div className="checkout__form">
            <form action="#" onSubmit={(e) => e.preventDefault()}>
              <div className="row">
                <div className="col-lg-8 col-md-6">
                  <h6 className="coupon__code"><span className="icon_tag_alt"></span> {t('checkout.haveCoupon')}</h6>
                  <h6 className="checkout__title">{t('checkout.billing')}</h6>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="checkout__input">
                        <p>{t('checkout.firstName')}<span>*</span></p>
                        <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="checkout__input">
                        <p>{t('checkout.lastName')}<span>*</span></p>
                        <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="checkout__input">
                    <p>{t('checkout.address')}<span>*</span></p>
                    <input type="text" placeholder={t('checkout.street')} className="checkout__input__add" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                    <input type="text" placeholder={t('checkout.apartment')} value={form.apartment} onChange={e => setForm(f => ({ ...f, apartment: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <button type="button" onClick={() => { resetMapPos(); setShowMap(true) }} style={{
                      padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.3)',
                      background: 'rgba(139,92,246,0.1)', color: 'var(--purple-light)', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <i className="fa fa-map-marker" style={{ fontSize: 16 }} />
                      {t('checkout.pickLocation')}
                    </button>
                    {form.gpsLat && form.gpsLng && (
                      <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: 12 }}>
                        <i className="fa fa-satellite" style={{ marginRight: 4 }} />
                        {form.gpsLat}, {form.gpsLng}
                      </span>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="checkout__input">
                        <p>{t('checkout.phone')}<span>*</span></p>
                        <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="checkout__input">
                        <p>{t('checkout.email')}<span>*</span></p>
                        <input type="text" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="checkout__order">
                    <h6 className="checkout__title">{t('checkout.yourOrder')}</h6>
                    <div className="checkout__order__product">{t('cart.product')} <span>{t('cart.total')}</span></div>
                    {cartItems.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>{t('checkout.empty')}</p>
                    ) : (
                      <>
                        <ul>
                          {cartItems.map(item => (
                            <li key={item.id}>{item.nameAr || item.name} × {item.qty} <span>EGP {item.price * item.qty}</span></li>
                          ))}
                        </ul>

                        <div style={{ margin: '12px 0', padding: '12px 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                              placeholder="Coupon code" style={{
                                flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
                                background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                              }} />
                            <button type="button" onClick={async () => {
                              if (!couponCode.trim()) return
                              try {
                                const coupons = await getCoupons()
                                const match = coupons.find(c => c.code === couponCode.trim().toUpperCase())
                                if (match) {
                                  const isExpired = match.expiresAt && new Date(match.expiresAt) < new Date()
                                  if (isExpired) { setCouponDiscount(0); setCouponMsg('Coupon has expired'); return }
                                  if (match.minAmount && total < Number(match.minAmount)) { setCouponDiscount(0); setCouponType('percentage'); setCouponMsg('Minimum order EGP ' + match.minAmount + ' not met'); return }
                                  const disc = Number(match.value) || 0
                                  setCouponDiscount(disc)
                                  const type = match.type || 'percentage'
                                  setCouponType(type)
                                  setCouponApplied(match.code)
                                  setCouponMsg(`Coupon applied! ${disc}${type === 'percentage' ? '%' : ' EGP'} off`)
                                  try { localStorage.setItem('coupon_discount', String(disc)) } catch {}
                                  try { localStorage.setItem('coupon_discount_type', type) } catch {}
                                  try { localStorage.setItem('coupon_applied_code', match.code) } catch {}
                                } else {
                                  setCouponDiscount(0)
                                  setCouponMsg('Invalid or expired coupon')
                                  try { localStorage.removeItem('coupon_discount') } catch {}
                                  try { localStorage.removeItem('coupon_discount_type') } catch {}
                                  try { localStorage.removeItem('coupon_applied_code') } catch {}
                                }
                              } catch { setCouponDiscount(0); setCouponMsg('Error applying coupon'); try { localStorage.removeItem('coupon_discount') } catch {}; try { localStorage.removeItem('coupon_discount_type') } catch {}; try { localStorage.removeItem('coupon_applied_code') } catch {} }
                            }} style={{
                              padding: '8px 14px', border: 'none', borderRadius: 6,
                              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                              color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}>
                              Apply
                            </button>
                          </div>
                          {couponMsg && <div style={{ marginTop: 6, fontSize: 12, color: couponDiscount ? '#22c55e' : 'var(--rose)' }}>{couponMsg}</div>}
                        </div>

                        {couponDiscount > 0 && (
                          <div className="checkout__order__total">
                            Discount ({couponDiscount}{couponType === 'percentage' ? '%' : ' EGP'}) <span style={{ color: '#22c55e' }}>-EGP {couponType === 'percentage' ? Math.round(total * couponDiscount / 100) : Math.min(couponDiscount, total)}</span>
                          </div>
                        )}
                        <div className="checkout__order__total">Total <span>EGP {couponType === 'percentage' ? Math.round(total * (100 - couponDiscount) / 100) : Math.max(0, total - couponDiscount)}</span></div>
                      </>
                    )}
                    <button
                      type="button"
                      className="site-btn"
                      onClick={() => {
                        if (cartItems.length === 0) return
                        if (!form.firstName || !form.lastName || !form.address || !form.phone) {
                          toast('Please fill in all required billing fields.', 'error')
                          return
                        }
                        try { localStorage.setItem('billing_info', JSON.stringify(form)) } catch {}
                        navigate('/payment', { state: { fromCart: true } })
                      }}
                    >
                      <i className="fa fa-credit-card" style={{ marginRight: 8 }} />Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {showMap && (
        <div style={modalOverlay} onClick={() => setShowMap(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa fa-map-marker" style={{ color: 'var(--purple)' }} />
                Pick Your Location
              </h3>
              <button onClick={() => setShowMap(false)} style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: 'var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>
                <i className="fa fa-times" />
              </button>
            </div>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <button onClick={handleGeoLocate} disabled={geoLoading} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: geoLoading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                color: '#fff', cursor: geoLoading ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <i className={`fa ${geoLoading ? 'fa-spinner fa-spin' : 'fa-crosshairs'}`} />
                {geoLoading ? 'Detecting...' : 'Use My Location'}
              </button>
              {mapPos && (
                <button onClick={confirmLocation} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
                  color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>
                  <i className="fa fa-check" style={{ marginRight: 6 }} />Confirm Location
                </button>
              )}
            </div>
            {reverseAddr && (
              <div style={{
                background: 'var(--bg-card)', borderRadius: 8, padding: '10px 14px',
                marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13, wordBreak: 'break-word',
              }}>
                <i className="fa fa-map-pin" style={{ marginRight: 6, color: 'var(--purple-light)' }} />
                {reverseAddr}
              </div>
            )}
            <div style={{ height: 400, borderRadius: 12, overflow: 'hidden' }}>
              <MapContainer center={mapPos || [30.0444, 31.2357]} zoom={mapPos ? 15 : 12}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToMap center={mapPos} />
                <LocationMarker position={mapPos} setPosition={(pos) => { setMapPos(pos); reverseGeocode(pos[0], pos[1]) }} />
              </MapContainer>
            </div>
            {!mapPos && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', margin: '10px 0 0 0' }}>
                <i className="fa fa-hand-pointer-o" style={{ marginRight: 4 }} />
                Click on the map to drop a pin, or use "Use My Location"
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Checkout
