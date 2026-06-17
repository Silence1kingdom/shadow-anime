import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, saveProduct } from '../utils/siteData'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import AdminProductEdit from '../components/AdminProductEdit'

function Shop() {
  const [shopProducts, setShopProducts] = useState([])
  useEffect(() => { getProducts().then(setShopProducts) }, [])
  const [searchParams, setSearchParams] = useSearchParams()
  const [openFilters, setOpenFilters] = useState({})
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchInput)
  const [activeCategory, setActiveCategory] = useState('')
  const [activePriceRange, setActivePriceRange] = useState('')
  const [activeSize, setActiveSize] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { t } = useI18n()
  const { isAdmin } = useAuth()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchInput), 250)
    return () => clearTimeout(t)
  }, [searchInput])

  const saveProducts = useCallback(async (updated) => {
    const list = shopProducts.map(p => p.id === updated.id ? { ...updated, image: updated.image || updated.img, img: updated.img || updated.image } : p)
    setShopProducts(list)
    await saveProduct(updated)
  }, [shopProducts])

  const categories = useMemo(() => [...new Set(shopProducts.map(p => p.category))], [shopProducts])

  const filteredProducts = useMemo(() => shopProducts.filter(p => {
    const matchesSearch = (p.name + ' ' + (p.nameAr || '')).toLowerCase().includes(debouncedQuery.toLowerCase())
    const matchesCategory = !activeCategory || p.category === activeCategory
    let matchesPrice = true
    if (activePriceRange) {
      const price = Number(p.price)
      if (activePriceRange === '0-500') matchesPrice = price >= 0 && price <= 500
      else if (activePriceRange === '500-1000') matchesPrice = price > 500 && price <= 1000
      else if (activePriceRange === '1000-1500') matchesPrice = price > 1000 && price <= 1500
      else if (activePriceRange === '1500+') matchesPrice = price > 1500
    }
    const matchesSize = !activeSize || !p.sizes || p.sizes.includes(activeSize)
    return matchesSearch && matchesCategory && matchesPrice && matchesSize
  }), [shopProducts, debouncedQuery, activeCategory, activePriceRange, activeSize])

  const suggestions = debouncedQuery.length > 0
    ? shopProducts.filter(p => (p.name + ' ' + (p.nameAr || '')).toLowerCase().includes(debouncedQuery.toLowerCase())).slice(0, 5)
    : []

  const sorted = useMemo(() => {
    const s = [...filteredProducts]
    if (sortBy === 'low') s.sort((a, b) => Number(a.price) - Number(b.price))
    else if (sortBy === 'high') s.sort((a, b) => Number(b.price) - Number(a.price))
    return s
  }, [filteredProducts, sortBy])

  const ITEMS_PER_PAGE = 9
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)

  const paginatedProducts = useMemo(() =>
    sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [sorted, page]
  )

  const toggleFilter = useCallback((id) => { setOpenFilters(prev => ({ ...prev, [id]: !prev[id] })) }, [])

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('nav.shop')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">{t('nav.home')}</Link>
                  <span>{t('nav.shop')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shop spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <div className="shop__sidebar">
                <div className="shop__sidebar__search">
                  <form action="#" onSubmit={(e) => e.preventDefault()} style={{ position: 'relative' }}>
                    <input type="text" placeholder={t('search.placeholder')} value={searchInput}
                      onChange={(e) => { setSearchInput(e.target.value); setPage(1); setShowSuggestions(true) }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                    <button type="submit"><span className="icon_search"></span></button>
                    {showSuggestions && suggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, zIndex: 20, maxHeight: 240, overflowY: 'auto' }}>
                        {suggestions.map(s => (
                          <div key={s.id} onMouseDown={() => { setSearchInput(s.name); setShowSuggestions(false) }}
                            style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <img src={s.image || s.img} alt="" loading="lazy" decoding="async" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{s.nameAr || s.name}</div>
                              <div style={{ color: 'var(--purple-light)', fontSize: 12, fontWeight: 600 }}>EGP {s.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </form>
                </div>
                <div className="shop__sidebar__accordion">
                  <div className="card">
                    <div className={`card-heading ${openFilters.categories ? 'active' : ''}`}>
                      <a href="#" onClick={(e) => { e.preventDefault(); toggleFilter('categories') }}>{t('product.categories')}</a>
                    </div>
                    {openFilters.categories && (
                      <div className="card-body">
                        <div className="shop__sidebar__categories">
                          <ul className="nice-scroll">
                            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveCategory(''); setPage(1) }} style={{ fontWeight: !activeCategory ? 700 : 400, color: !activeCategory ? 'var(--purple)' : undefined }}>{t('product.all')}</a></li>
                            {categories.map(cat => (
                              <li key={cat}><a href="#" onClick={(e) => { e.preventDefault(); setActiveCategory(cat); setPage(1) }} style={{ fontWeight: activeCategory === cat ? 700 : 400, color: activeCategory === cat ? 'var(--purple)' : undefined }}>{cat}</a></li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <div className={`card-heading ${openFilters.price ? 'active' : ''}`}>
                      <a href="#" onClick={(e) => { e.preventDefault(); toggleFilter('price') }}>{t('product.filterPrice')}</a>
                    </div>
                    {openFilters.price && (
                      <div className="card-body">
                        <div className="shop__sidebar__price">
                          <ul>
                            {[
                              { label: 'EGP 0 - 500', value: '0-500' },
                              { label: 'EGP 500 - 1,000', value: '500-1000' },
                              { label: 'EGP 1,000 - 1,500', value: '1000-1500' },
                              { label: 'EGP 1,500+', value: '1500+' },
                            ].map(r => (
                              <li key={r.value}><a href="#" onClick={(e) => { e.preventDefault(); setActivePriceRange(r.value); setPage(1) }} style={{ fontWeight: activePriceRange === r.value ? 700 : 400, color: activePriceRange === r.value ? 'var(--purple)' : undefined }}>{r.label}</a></li>
                            ))}
                            {activePriceRange && (
                              <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePriceRange(''); setPage(1) }} style={{ color: 'var(--rose)', fontSize: 12 }}>{t('product.clear')}</a></li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <div className={`card-heading ${openFilters.size ? 'active' : ''}`}>
                      <a href="#" onClick={(e) => { e.preventDefault(); toggleFilter('size') }}>{t('product.filterSize')}</a>
                    </div>
                    {openFilters.size && (
                      <div className="card-body">
                        <div className="shop__sidebar__price">
                          <ul>
                            {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
                              <li key={s}><a href="#" onClick={(e) => { e.preventDefault(); setActiveSize(activeSize === s ? '' : s); setPage(1) }} style={{ fontWeight: activeSize === s ? 700 : 400, color: activeSize === s ? 'var(--purple)' : undefined }}>{s}</a></li>
                            ))}
                            {activeSize && (
                              <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveSize(''); setPage(1) }} style={{ color: 'var(--rose)', fontSize: 12 }}>{t('product.clear')}</a></li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              <div className="shop__product__option">
                <div className="row">
                  <div className="col-lg-6 col-md-6 col-sm-6">
                    <div className="shop__product__option__left">
                      <p>{sorted.length > 0 ? t('product.showing', { from: 1, to: sorted.length, total: sorted.length }) : t('product.noResults')}</p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6">
                    <div className="shop__product__option__right">
                      <p>{t('product.sortBy')}</p>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="">{t('product.default')}</option>
                        <option value="low">{t('product.lowToHigh')}</option>
                        <option value="high">{t('product.highToLow')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                {paginatedProducts.map((p) => (
                  <div key={p.id} className="col-lg-4 col-md-6 col-sm-6">
                    <div className={`product__item ${p.sale ? 'sale' : ''}`}>
                      <div className="product__item__pic" style={{ backgroundImage: `url(${p.image || p.img})`, position: 'relative' }} aria-label={p.name}>
                        {p.sale && <span className="label">{t('product.sale')}</span>}
                        {isAdmin && (
                          <button onClick={() => setEditingProduct(p)} style={{
                            position: 'absolute', top: 8, left: 8, width: 32, height: 32, borderRadius: '50%', border: 'none',
                            background: 'rgba(139,92,246,0.9)', color: '#fff', fontSize: 14, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, transition: 'all 0.2s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            title="Edit product">
                            <i className="fa fa-pencil"></i>
                          </button>
                        )}
                      </div>
                      <div className="product__item__text">
                        <h6>{p.nameAr || p.name}</h6>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{p.name}</p>
                        <Link to={`/shop-details?id=${p.id}`} state={{ product: p }} className="add-cart">{t('product.addToCart')}</Link>
                        <div className="rating">
                          {[1, 2, 3, 4, 5].map(r => (
                            <i key={r} className={`fa fa-star${r > 3 ? '-o' : ''}`}></i>
                          ))}
                        </div>
                        <h5>EGP {p.price}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="product__pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <a key={i + 1} href="#" onClick={(e) => { e.preventDefault(); setPage(i + 1) }} className={page === i + 1 ? 'active' : ''}>{i + 1}</a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default Shop
