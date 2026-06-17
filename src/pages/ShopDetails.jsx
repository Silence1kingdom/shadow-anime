import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useAuth } from '../context/AuthContext'
import { getProducts } from '../utils/siteData'
import { addToCart as supabaseAddToCart } from '../supabase/data'
import { useToast } from '../components/Toast'
import { useI18n } from '../context/I18nContext'

const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']

function ShopDetails() {
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' })
  const [reviews, setReviews] = useState(() => {
    try {
      const raw = localStorage.getItem('product_reviews')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [related, setRelated] = useState([])
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addRecent } = useRecentlyViewed()
  const { user } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const productId = searchParams.get('id')
  const [product, setProduct] = useState(location.state?.product || null)
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useI18n()

  const [notification, setNotification] = useState(false)

  useEffect(() => {
    if (product) return
    if (productId) {
      getProducts().then(all => {
        const found = all.find(p => String(p.id) === productId)
        if (found) setProduct(found)
      })
    }
  }, [productId, product])

  useEffect(() => {
    if (!product) return
    addRecent(product)
    getProducts().then(all => {
      setRelated(all.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4))
    })
  }, [product])

  if (!product) {
    return (
      <section className="spad"><div className="container"><div style={{ textAlign: 'center', padding: 60 }}><h3>{t('product.notFound', 'Product not found')}</h3><Link to="/shop" className="site-btn" style={{ marginTop: 20 }}>{t('product.backToShop', 'Back to Shop')}</Link></div></div></section>
    )
  }

  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0
    ? [product.image || product.img, ...product.gallery]
    : [product.image || product.img]

  const productReviews = reviews.filter(r => r.productId === product.id)
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : 0

  const sizes = product.sizes || []

  const addToCart = async () => {
    if (sizes.length > 0 && !selectedSize) { toast?.('Please select a size', 'warning'); return }
    if (user) {
      await supabaseAddToCart(user.id, product.id, qty)
    }
    setAdded(true)
    setNotification(true)
    toast?.('Added to cart!', 'success')
    setTimeout(() => { setNotification(false) }, 2500)
    setTimeout(() => { setAdded(false); navigate('/shopping-cart') }, 700)
  }

  const buyNow = async () => {
    if (sizes.length > 0 && !selectedSize) { toast?.('Please select a size', 'warning'); return }
    if (user) {
      await supabaseAddToCart(user.id, product.id, qty)
    }
    navigate('/checkout')
  }

  const submitReview = (e) => {
    e.preventDefault()
    if (!reviewForm.name || !reviewForm.comment) return
    const review = {
      ...reviewForm,
      productId: product.id,
      userId: user?.email || 'guest',
      date: new Date().toISOString(),
    }
    const updated = [...reviews, review]
    setReviews(updated)
    try { localStorage.setItem('product_reviews', JSON.stringify(updated)) } catch {}
    setReviewForm({ name: '', rating: 5, comment: '' })
  }

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{product.nameAr || product.name}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <Link to="/shop">Shop</Link>
                  <span>{product.nameAr || product.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-details spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="shop__details__pic" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)', cursor: 'crosshair' }}
                onClick={() => { setGalleryIdx(0); setShowGallery(true) }}
                onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setZoomPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }) }}>
                <img src={product.image || product.img} alt={product.name} loading="lazy" decoding="async" style={{ width: '100%', display: 'block', transform: 'scale(1.8)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transition: 'transform-origin 0.1s' }} />
                {gallery.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                    <i className="fa fa-images" style={{ marginRight: 4 }} />{gallery.length} {t('product.photos', 'photos')}
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {gallery.slice(0, 4).map((url, i) => (
                    <img key={i} src={url} alt="" loading="lazy" decoding="async" onClick={() => { setGalleryIdx(i); setShowGallery(true) }}
                      style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', border: i === 0 ? '2px solid #8b5cf6' : '1px solid var(--border-glass)', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  ))}
                </div>
              )}
            </div>
            <div className="col-lg-6">
              <div className="shop__details__text">
                <p style={{ color: 'var(--purple)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>{product.category}</p>
                <h3>{product.nameAr || product.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 8px' }}>{product.name}</p>
                <h2>EGP {product.price}</h2>
                <div className="rating" style={{ marginBottom: 15 }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <i key={r} className={`fa fa-star${r > Math.round(avgRating) ? '-o' : ''}`} style={{ color: r > Math.round(avgRating) ? 'var(--text-muted)' : '#fbbf24', marginRight: 2 }} />
                  ))}
                  <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>({productReviews.length} reviews)</span>
                </div>
                <p>{product.desc}</p>
                <div className="shop__details__option">
                  <div className="shop__details__option__size">
                    <span>{t('product.size')}</span>
                    {(sizes.length > 0 ? sizes : allSizes).map(s => (
                      <label key={s} htmlFor={s}
                        className={selectedSize === s ? 'active' : ''}
                        onClick={() => setSelectedSize(s)}>
                        {s}
                        <input type="radio" id={s} name="size" checked={selectedSize === s} readOnly />
                      </label>
                    ))}
                    <button onClick={() => setShowSizeGuide(true)} style={{
                      marginLeft: 10, background: 'none', border: 'none', color: 'var(--purple)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                    }}>
                      <i className="fa fa-ruler" style={{ marginRight: 4 }} />{t('product.sizeGuide', 'Size Guide')}
                    </button>
                  </div>
                </div>
                <div className="shop__details__qty">
                  <div className="quantity">
                    <div className="pro-qty" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => setQty(Math.max(1, qty - 1))}
                        style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer' }}>-</button>
                      <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 18 }}>{qty}</span>
                      <button onClick={() => setQty(qty + 1)}
                        style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  <button onClick={addToCart} className="primary-btn" style={added ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)' } : {}}>
                    {added ? `✓ ${t('product.added', 'Added!')}` : t('product.addToCart')}
                  </button>
                  <button onClick={buyNow} className="primary-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                    {t('product.buyNow', 'Buy Now')}
                  </button>
                </div>
                <div className="shop__details__btns" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="#" className="heart-btn" onClick={e => { e.preventDefault(); toggleWishlist(product) }}>
                    <span className="icon_heart_alt"></span> {isInWishlist(product.id) ? t('product.inWishlist', 'In Wishlist') : t('product.addToWishlist', 'Add to Wishlist')}
                  </a>
                  <button onClick={() => { const url = window.location.href; navigator.clipboard?.writeText(url); toast('Link copied!', 'success') }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa fa-share-alt" /> {t('product.share', 'Share')}
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - EGP ${product.price}\n${window.location.href}`)}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#22c55e', fontSize: 16, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <i className="fa fa-whatsapp" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 40 }}>
            <div className="col-lg-12">
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 16, padding: 28 }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: 18, marginBottom: 20 }}>
                  <i className="fa fa-star" style={{ color: '#fbbf24', marginRight: 8 }} />
                  {t('product.reviews')} ({productReviews.length})
                </h4>

                {productReviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('product.noReviews', 'No reviews yet. Be the first to review!')}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: 300, overflowY: 'auto' }}>
                    {productReviews.map((r, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{r.name}</strong>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <i key={star} className={`fa fa-star${star > r.rating ? '-o' : ''}`} style={{ color: star > r.rating ? '#475569' : '#fbbf24', fontSize: 12 }} />
                              ))}
                            </div>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 20 }}>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: 15, marginBottom: 12 }}>{t('product.writeReview', 'Write a Review')}</h5>
                  <form onSubmit={submitReview} style={{ maxWidth: 500 }}>
                    <div style={{ marginBottom: 10 }}>
                      <input value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={t('checkout.firstName', 'Your name')} required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('product.rating', 'Rating:')}</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <i key={star} className={`fa fa-star${star > reviewForm.rating ? '-o' : ''}`}
                          style={{ color: star > reviewForm.rating ? '#475569' : '#fbbf24', fontSize: 18, cursor: 'pointer' }}
                          onClick={() => setReviewForm(f => ({ ...f, rating: star }))} />
                      ))}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder={t('product.reviewPlaceholder', 'Write your review...')} required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="site-btn" style={{ fontSize: 13, padding: '12px 28px' }}>
                      <i className="fa fa-paper-plane" style={{ marginRight: 6 }} />{t('product.submitReview', 'Submit Review')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="row" style={{ marginTop: 40 }}>
            <div className="col-lg-12">
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 16, padding: 28 }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: 18, marginBottom: 20 }}>
                  <i className="fa fa-link" style={{ color: 'var(--purple)', marginRight: 8 }} />
                  {t('product.relatedProducts', 'Related Products')}
                </h4>
                <div className="row">
                  {related.map(rp => (
                    <div key={rp.id} className="col-lg-3 col-md-6 col-sm-6">
                      <div className="product__item" style={{ cursor: 'pointer' }}
                        onClick={() => { navigate(`/shop-details?id=${rp.id}`, { state: { product: rp } }); window.scrollTo(0, 0) }}>
                        <div className="product__item__pic" style={{ backgroundImage: `url(${rp.image || rp.img})`, height: 200, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8 }} />
                        <div className="product__item__text" style={{ padding: '12px 0' }}>
                          <h6 style={{ fontSize: 14, margin: 0 }}>{rp.nameAr || rp.name}</h6>
                          <h5 style={{ color: 'var(--purple-light)', margin: '4px 0 0', fontSize: 15 }}>EGP {rp.price}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {showGallery && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowGallery(false)}>
          <div style={{ position: 'relative', maxWidth: 700, width: '100%' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowGallery(false)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', zIndex: 2 }}><i className="fa fa-times" /></button>
            <img src={gallery[galleryIdx]} alt="" loading="lazy" decoding="async" style={{ width: '100%', borderRadius: 12, maxHeight: '80vh', objectFit: 'contain' }} />
            {gallery.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                <button onClick={() => setGalleryIdx(i => (i - 1 + gallery.length) % gallery.length)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}><i className="fa fa-chevron-left" /></button>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center' }}>{galleryIdx + 1} / {gallery.length}</span>
                <button onClick={() => setGalleryIdx(i => (i + 1) % gallery.length)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}><i className="fa fa-chevron-right" /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSizeGuide && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowSizeGuide(false)}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa fa-ruler" style={{ color: 'var(--purple)' }} />{t('product.sizeGuide', 'Size Guide')}
              </h3>
              <button onClick={() => setShowSizeGuide(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <i className="fa fa-times" />
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('product.size')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('product.chest', 'Chest (cm)')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('product.length', 'Length (cm)')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('product.shoulder', 'Shoulder (cm)')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'S', chest: '91-96', length: '66-69', shoulder: '41-43' },
                  { size: 'M', chest: '97-102', length: '70-73', shoulder: '44-46' },
                  { size: 'L', chest: '103-108', length: '74-77', shoulder: '47-49' },
                  { size: 'XL', chest: '109-114', length: '78-81', shoulder: '50-52' },
                  { size: '2XL', chest: '115-120', length: '82-85', shoulder: '53-55' },
                  { size: '3XL', chest: '121-126', length: '86-89', shoulder: '56-58' },
                ].map(row => (
                  <tr key={row.size} style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{row.size}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.chest}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.length}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notification && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'rgba(34,197,94,0.95)', color: '#fff', padding: '14px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeInUp 0.3s ease' }}>
          <i className="fa fa-check-circle" style={{ fontSize: 18 }} />Added to cart!
        </div>
      )}
    </>
  )
}

export default ShopDetails
