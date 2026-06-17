import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useI18n } from '../context/I18nContext'

function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist()
  const { t } = useI18n()

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('wishlist.title')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">{t('nav.home')}</Link>
                  <span>{t('wishlist.title')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {wishlist.length === 0 ? (
        <section className="empty-wishlist spad">
          <div className="container text-center" style={{ padding: '80px 0' }}>
            <div style={{ fontSize: 80, color: '#e53637', marginBottom: 20, animation: 'pulse 1.5s ease-in-out infinite' }}>
              <i className="fa fa-heart-o"></i>
            </div>
            <h3>{t('wishlist.empty')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 25 }}>{t('wishlist.emptyMsg')}</p>
            <Link to="/shop" className="primary-btn">{t('wishlist.browse')}</Link>
          </div>
        </section>
      ) : (
        <section className="shop spad">
          <div className="container">
            <div className="row">
              {wishlist.map(p => (
                <div key={p.id} className="col-lg-4 col-md-6 col-sm-6">
                  <div
                    className="product__item"
                    style={{ transition: 'all 0.3s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
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
                        onMouseEnter={e => { e.currentTarget.style.background = '#e53637'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.color = '#e53637' }}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                    <div className="product__item__text">
                      <h6>{p.nameAr || p.name}</h6>
                      <Link to={`/shop-details?id=${p.id}`} state={{ product: p }} className="add-cart">View Details</Link>
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
          </div>
        </section>
      )}
    </>
  )
}

export default Wishlist
