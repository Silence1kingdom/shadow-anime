import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { getCartItems } from '../utils/siteData'

const navLinks = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/shop', labelKey: 'nav.shop' },
  {
    path: '#', labelKey: 'nav.pages', dropdown: [
      { path: '/about', labelKey: 'nav.about' },
      { path: '/shop-details', labelKey: 'nav.shopDetails' },
      { path: '/shopping-cart', labelKey: 'nav.cart' },
      { path: '/wishlist', labelKey: 'nav.wishlist' },
      { path: '/checkout', labelKey: 'nav.checkout' },
      { path: '/tracking', labelKey: 'nav.tracking' },
      { path: '/blog', labelKey: 'nav.blog' },
      { path: '/blog-details', labelKey: 'nav.blogDetails' },
      { path: '/contact', labelKey: 'nav.contacts' },
    ]
  },
  { path: '/blog', labelKey: 'nav.blog' },
  { path: '/contact', labelKey: 'nav.contacts' },
]

function Header() {
  const location = useLocation()
  const { t, lang, setLang } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const { wishlist } = useWishlist()
  const { user, signOut, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [topSearch, setTopSearch] = useState('')
  const navigate = useNavigate()

  const handleTopSearch = (e) => {
    e.preventDefault()
    if (topSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(topSearch.trim())}`)
      setTopSearch('')
    }
  }

  useEffect(() => {
    if (!user) { setCartCount(0); setCartTotal(0); return }
    function updateCart() {
      getCartItems(user.uid).then(items => {
        setCartCount(items.length)
        setCartTotal(items.reduce((sum, item) => sum + (Number(item.products?.price || 0)) * (item.quantity || 1), 0))
      }).catch(() => { setCartCount(0); setCartTotal(0) })
    }
    updateCart()
    const interval = setInterval(updateCart, 2000)
    return () => clearInterval(interval)
  }, [user])

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en')

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #1a0533, #0a0a1a)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        padding: '10px 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 500, margin: '0 auto' }}>
            <i className="fa fa-search" style={{ color: 'var(--text-muted)', fontSize: 14, flexShrink: 0 }} />
            <form onSubmit={handleTopSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <input id="top-search-input" type="text" value={topSearch} onChange={e => setTopSearch(e.target.value)}
                placeholder={t('search.placeholder') || 'Search products...'}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                }} />
              <button type="submit" style={{
                padding: '8px 16px', border: 'none', borderRadius: 6,
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {t('search.search') || 'Search'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className={`offcanvas-menu-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)}></div>
      <div className={`offcanvas-menu-wrapper ${menuOpen ? 'active' : ''}`}>
        <div className="offcanvas__option">
          <div className="offcanvas__links">
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" style={{ color: 'var(--purple)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Admin Panel</Link>
                ) : (
                  <Link to="/profile" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}><i className="fa fa-user" style={{ marginRight: 4 }}></i>{user.displayName || user.email}</Link>
                )}
                <a href="#" onClick={(e) => { e.preventDefault(); signOut() }} style={{ color: '#e53637' }}>{t('auth.signOut')}</a>
              </>
            ) : (
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>{t('nav.signIn')}</Link>
            )}
            <a href="#" onClick={(e) => e.preventDefault()}>{t('nav.faqs')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleLang() }}>{lang === 'en' ? 'AR' : 'EN'}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleTheme() }}>
              <i className={`fa fa-${theme === 'dark' ? 'sun-o' : 'moon-o'}`}></i>
            </a>
          </div>
          <div className="offcanvas__top__hover">
            <span>EGP <i className="arrow_carrot-down"></i></span>
            <ul><li>EGP</li></ul>
          </div>
        </div>
        <div className="offcanvas__nav__option">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { const inp = document.querySelector('#top-search-input'); if (inp) inp.focus() }, 300) }} title="Search"><i className="fa fa-search"></i></a>
          <Link to="/wishlist" title="Wishlist"><i className="fa fa-heart-o"></i> {wishlist.length > 0 && <span>{wishlist.length}</span>}</Link>
          <Link to="/shopping-cart" title="Cart"><i className="fa fa-shopping-cart"></i> <span>{cartCount}</span></Link>
          <span className="price">EGP {cartTotal}</span>
        </div>
        <div id="mobile-menu-wrap">
          <ul>
            {navLinks.map(link => (
              <li key={link.path}>
                {link.dropdown ? (
                  <>
                    <a href="#" onClick={(e) => e.preventDefault()}>{t(link.labelKey)}</a>
                    <ul className="dropdown">
                      {link.dropdown.map(sub => (
                        <li key={sub.path}><Link to={sub.path} onClick={() => setMenuOpen(false)}>{t(sub.labelKey)}</Link></li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link to={link.path} onClick={() => setMenuOpen(false)}>{t(link.labelKey)}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="offcanvas__text">
          <p>{t('footer.freeShipping')}</p>
        </div>
      </div>

      <header className="header">
        <div className="header__top">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-md-7">
                <div className="header__top__left">
                  <p>{t('footer.freeShipping')}</p>
                </div>
              </div>
              <div className="col-lg-6 col-md-5">
                <div className="header__top__right">
                  <div className="header__top__links">
                    {user ? (
                      <>
                        {isAdmin ? (
                          <Link to="/admin" style={{ color: 'var(--purple)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Admin Panel</Link>
                        ) : (
                          <Link to="/profile" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}><i className="fa fa-user" style={{ marginRight: 4 }}></i>{user.displayName || user.email}</Link>
                        )}
                        <a href="#" onClick={(e) => { e.preventDefault(); signOut() }} style={{ color: '#e53637' }}>{t('auth.signOut')}</a>
                      </>
                    ) : (
                      <Link to="/login" style={{ color: 'inherit', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>{t('nav.signIn')}</Link>
                    )}
                    <a href="#" onClick={(e) => e.preventDefault()}>{t('nav.faqs')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); toggleLang() }}>{lang === 'en' ? 'AR' : 'EN'}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); toggleTheme() }}>
                      <i className={`fa fa-${theme === 'dark' ? 'sun-o' : 'moon-o'}`}></i>
                    </a>
                  </div>
                  <div className="header__top__hover">
                    <span>EGP <i className="arrow_carrot-down"></i></span>
                    <ul><li>EGP</li></ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-3">
              <div className="header__logo">
                <Link to="/" className="logo">SHADOW <span>ANIME</span></Link>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <nav className="header__menu mobile-menu">
                <ul>
                  {navLinks.map(link => (
                    <li key={link.path} className={link.dropdown ? '' : (location.pathname === link.path ? 'active' : '')}>
                      {link.dropdown ? (
                        <>
                          <a href="#" onClick={(e) => e.preventDefault()}>{t(link.labelKey)}</a>
                          <ul className="dropdown">
                            {link.dropdown.map(sub => (
                              <li key={sub.path} className={location.pathname === sub.path ? 'active' : ''}>
                                <Link to={sub.path}>{t(sub.labelKey)}</Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <Link to={link.path}>{t(link.labelKey)}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="col-lg-3 col-md-3">
              <div className="header__nav__option">
                <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { const inp = document.querySelector('#top-search-input'); if (inp) inp.focus() }, 300) }} title="Search"><i className="fa fa-search"></i></a>
                <Link to="/wishlist" title="Wishlist"><i className="fa fa-heart-o"></i> {wishlist.length > 0 && <span>{wishlist.length}</span>}</Link>
                <Link to="/shopping-cart" title="Cart"><i className="fa fa-shopping-cart"></i> <span>{cartCount}</span></Link>
                <div className="price">EGP {cartTotal}</div>
              </div>
            </div>
          </div>
          <div className="canvas__open" onClick={() => setMenuOpen(true)}><i className="fa fa-bars"></i></div>
        </div>
      </header>

      <div className={`search-model ${searchOpen ? 'active' : ''}`}>
        <div className="h-100 d-flex align-items-center justify-content-center">
          <div className="search-close-switch" onClick={() => setSearchOpen(false)}>+</div>
          <form className="search-model-form" onSubmit={(e) => { e.preventDefault(); setSearchOpen(false) }}>
            <input type="text" id="search-input" placeholder={t('search.placeholder')} />
          </form>
        </div>
      </div>
    </>
  )
}

export default Header
