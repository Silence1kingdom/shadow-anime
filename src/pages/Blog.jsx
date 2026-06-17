import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useI18n } from '../context/I18nContext'
import { getBlogPosts } from '../utils/siteData'

function Blog() {
  const { t } = useI18n()
  const [posts, setPosts] = useState([])
  useEffect(() => { getBlogPosts().then(setPosts) }, [])
  const [search, setSearch] = useState('')

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('blog.title')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">{t('nav.home')}</Link>
                  <span>{t('blog.title')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog spad">
        <div className="container">
          <div className="row" style={{ marginBottom: 30 }}>
            <div className="col-lg-12">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 500,
                  padding: '12px 20px',
                  borderRadius: 30,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>
          <div className="row">
            {filtered.map((post) => (
              <div key={post.id} className="col-lg-4 col-md-6 col-sm-6">
                <div
                  className="blog__item"
                  style={{ transition: 'all 0.3s ease', cursor: 'pointer', background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-glass)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    className="blog__item__pic"
                    aria-label={post.title}
                    style={{
                      background: post.gradient,
                      height: '240px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 30% 50%, var(--border-glass) 0%, transparent 60%)',
                    }} />
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <i className={`fa ${post.icon}`} style={{ fontSize: 32, color: 'rgba(255,255,255,0.7)' }} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                    }} />
                  </div>
                  <div className="blog__item__text" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <i className="fa fa-calendar" style={{ marginRight: 5 }} />
                      {post.date}
                    </span>
                    <h5 style={{ marginTop: 8, fontSize: 18, lineHeight: 1.4 }}>{post.title}</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 15 }}>
                      {post.excerpt}
                    </p>
                    <Link
                      to="/blog-details"
                      state={{ post }}
                      style={{
                        display: 'inline-block',
                        padding: '10px 24px',
                        borderRadius: 30,
                        background: post.gradient,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        textDecoration: 'none',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      {t('blog.readMore')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Blog
