import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getSocialLinks, saveProduct } from '../utils/siteData'
import { useAuth } from '../context/AuthContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useI18n } from '../context/I18nContext'
import AdminProductEdit from '../components/AdminProductEdit'

function Home() {
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [socialLinks, setSocialLinks] = useState({})
  const { isAdmin } = useAuth()
  const { recent } = useRecentlyViewed()
  const { t } = useI18n()
  useEffect(() => { getProducts().then(setProducts) }, [])
  useEffect(() => { getSocialLinks().then(setSocialLinks) }, [])
  const saveProducts = async (updated) => {
    const list = products.map(p => p.id === updated.id ? { ...updated, image: updated.image || updated.img, img: updated.img || updated.image } : p)
    setProducts(list)
    await saveProduct(updated)
  }
  const [slide, setSlide] = useState(0)
  const slides = [
    { subtitle: t('hero.subtitle1'), title: t('hero.title1'), desc: t('hero.desc1'), gradient: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0a0a1a 40%, #050510 100%)', img: '/img/products/anime-tee-1.jpg' },
    { subtitle: t('hero.subtitle2'), title: t('hero.title2'), desc: t('hero.desc2'), gradient: 'radial-gradient(ellipse at 80% 50%, #0a1a33 0%, #0a0a1a 40%, #050510 100%)', img: '/img/products/anime-tee-3.jpg' },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero__slider" style={{ position: 'relative', overflow: 'hidden' }}>
          {slides.map((s, i) => (
            <div key={i} className="hero__items" style={{
              display: i === slide ? 'flex' : 'none',
              background: s.gradient,
              minHeight: '600px', alignItems: 'center',
              '--hero-img': `url(${s.img})`
            }}>
              <div className="container">
                <div className="row">
                  <div className="col-xl-5 col-lg-7 col-md-8">
                    <div className="hero__text">
                      <h6>{s.subtitle}</h6>
                      <h2>{s.title}</h2>
                      <p>{s.desc}</p>
                      <Link to="/shop" className="primary-btn">{t('hero.shopNow')} <span className="arrow_right"></span></Link>
                      <div className="hero__social">
                        {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>}
                        {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>}
                        {socialLinks.pinterest && <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer"><i className="fa fa-pinterest"></i></a>}
                        {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setSlide(s => (s - 1 + slides.length) % slides.length)} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#fff', fontSize: '24px', padding: '12px 18px', cursor: 'pointer', borderRadius: '50%', backdropFilter: 'blur(10px)', transition: 'all 0.3s' }} aria-label="Previous"><span className="arrow_left"></span></button>
          <button onClick={() => setSlide(s => (s + 1) % slides.length)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#fff', fontSize: '24px', padding: '12px 18px', cursor: 'pointer', borderRadius: '50%', backdropFilter: 'blur(10px)', transition: 'all 0.3s' }} aria-label="Next"><span className="arrow_right"></span></button>
        </div>
      </section>

      <section className="banner spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 offset-lg-4">
              <div className="banner__item">
                <div className="banner__item__pic">
                  <img src="/img/products/anime-tee-1.jpg" alt="Tanjiro Kamado Tee" loading="lazy" decoding="async" />
                </div>
                <div className="banner__item__text">
                  <h2>{t('banner.animeCollection')}</h2>
                  <Link to="/shop">{t('banner.shopNow')}</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="banner__item banner__item--middle">
                <div className="banner__item__pic">
                  <img src="/img/products/anime-tee-2.jpg" alt="Gojo Satoru Hoodie" loading="lazy" decoding="async" />
                </div>
                <div className="banner__item__text">
                  <h2>{t('banner.anime')}</h2>
                  <Link to="/shop">{t('banner.shopNow')}</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="banner__item banner__item--last">
                <div className="banner__item__pic">
                  <img src="/img/products/anime-tee-3.jpg" alt="Kakashi Jacket" loading="lazy" decoding="async" />
                </div>
                <div className="banner__item__text">
                  <h2>{t('banner.accessories')}</h2>
                  <Link to="/shop">{t('banner.shopNow')}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>{t('product.sectionTitle')}</span>
                <h2>{t('product.sectionSubtitle')}</h2>
              </div>
            </div>
          </div>
          <div className="row product__filter">
            {products.map((p) => (
              <div key={p.id} className="col-lg-3 col-md-6 col-sm-6">
                <div className={`product__item ${p.sale ? 'sale' : ''}`}>
                  <div className="product__item__pic" style={{ backgroundImage: `url(${p.image || p.img})`, position: 'relative' }}>
                    {p.sale && <span className="label">{t('product.sale')}</span>}
                    {isAdmin && (
                      <button onClick={() => setEditingProduct(p)} style={{
                        position: 'absolute', top: 8, left: 8,
                        width: 32, height: 32, borderRadius: '50%', border: 'none',
                        background: 'rgba(139,92,246,0.9)', color: '#fff', fontSize: 14,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 5,
                      }} title="Edit product">
                        <i className="fa fa-pencil"></i>
                      </button>
                    )}
                  </div>
                  <div className="product__item__text">
                    <h6>{p.nameAr || p.name}</h6>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{p.name}</p>
                    <Link to={`/shop-details?id=${p.id}`} state={{ product: p }} className="add-cart">{t('product.addToCart')}</Link>
                    <h5>EGP {p.price}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="product spad">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-title">
                  <span>{t('product.recentlyViewed', 'Recently Viewed')}</span>
                  <h2>{t('product.yourRecent', 'Your Recent Products')}</h2>
                </div>
              </div>
            </div>
            <div className="row product__filter">
              {recent.map((p) => (
                <div key={p.id} className="col-lg-3 col-md-6 col-sm-6">
                  <div className={`product__item ${p.sale ? 'sale' : ''}`}>
                    <div className="product__item__pic" style={{ backgroundImage: `url(${p.image || p.img})`, position: 'relative' }}>
                      {p.sale && <span className="label">{t('product.sale')}</span>}
                    </div>
                    <div className="product__item__text">
                      <h6>{p.nameAr || p.name}</h6>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{p.name}</p>
                      <Link to={`/shop-details?id=${p.id}`} state={{ product: p }} className="add-cart">{t('product.addToCart')}</Link>
                      <h5>EGP {p.price}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {editingProduct && (
        <AdminProductEdit
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={saveProducts}
        />
      )}
    </>
  )
}

export default Home
