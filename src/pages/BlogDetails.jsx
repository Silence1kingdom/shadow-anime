import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

const fallbackPost = {
  id: 1,
  title: 'Top 10 Anime Fashion Trends in 2026',
  date: '16 February 2026',
  gradient: 'linear-gradient(135deg, #1a0533 0%, #8b5cf6 100%)',
  icon: 'fa-tags',
  excerpt: 'From Demon Slayer inspired Haori jackets to Jujutsu Kaisen hoodies, discover the top anime fashion trends dominating 2026.',
}

const allPosts = [
  { id: 1, title: 'Top 10 Anime Fashion Trends in 2026', date: '16 February 2026', gradient: 'linear-gradient(135deg, #1a0533 0%, #8b5cf6 100%)', icon: 'fa-tags' },
  { id: 2, title: 'How to Style Your Anime Hoodie', date: '21 February 2026', gradient: 'linear-gradient(135deg, #0a1a33 0%, #06b6d4 100%)', icon: 'fa-tshirt' },
  { id: 3, title: 'Demon Slayer: The New Collection', date: '28 February 2026', gradient: 'linear-gradient(135deg, #1a0533 0%, #e53637 100%)', icon: 'fa-fire' },
  { id: 4, title: 'Jujutsu Kaisen Merch Guide', date: '5 March 2026', gradient: 'linear-gradient(135deg, #0a0533 0%, #7c3aed 100%)', icon: 'fa-diamond' },
  { id: 5, title: 'Attack on Titan Final Season Gear', date: '12 March 2026', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #dc2626 100%)', icon: 'fa-shield' },
  { id: 6, title: 'Naruto Retro Collection Drop', date: '19 March 2026', gradient: 'linear-gradient(135deg, #1a1a0a 0%, #f59e0b 100%)', icon: 'fa-star' },
]

const contentMap = {
  1: {
    content: [
      'Anime fashion has taken the world by storm. From Demon Slayer inspired Haori jackets to Jujutsu Kaisen hoodies, the influence of anime on streetwear is undeniable. In this post, we explore the top trends dominating the scene.',
      'Whether you are a fan of the classic Naruto headbands or the modern Chainsaw Man graphic tees, there is something for every otaku. Our latest collection brings you premium quality apparel that lets you wear your fandom with pride.',
      'The fusion of anime aesthetics with streetwear has created a unique fashion movement. Designers are increasingly drawing inspiration from iconic characters, color palettes, and symbolism found in popular series.',
      'From subtle references like embroidery and patches to bold all-over prints, anime fashion offers endless possibilities for self-expression. The key is finding pieces that resonate with your personal style.',
    ],
    tags: ['anime', 'fashion', 'trends', 'otaku'],
  },
  2: {
    content: [
      'Anime hoodies have become a staple in streetwear fashion. Whether you are going for a casual look or something more bold, styling your favorite anime hoodie can elevate your entire outfit.',
      'The key to styling an anime hoodie is balance. Pair a bold graphic hoodie with neutral bottoms like black jeans or cargo pants. This lets the hoodie be the statement piece without overwhelming your look.',
      'Layering is another great technique. Wear your hoodie under a denim or leather jacket for a textured, dimensional look. In colder months, layer it over a long-sleeve tee for extra warmth and style.',
      'Accessorize wisely. A simple cap, chain, or backpack in complementary colors can tie your whole look together without competing with the hoodie design.',
    ],
    tags: ['styling', 'hoodie', 'streetwear', 'fashion'],
  },
  3: {
    content: [
      'The Demon Slayer phenomenon shows no signs of slowing down. Our new collection brings the world of Kimetsu no Yaiba to life with designs that capture the essence of your favorite characters.',
      'Each piece in the collection is inspired by the distinct visual style of the series. From Tanjiro checkered patterns to the flame motifs of Rengoku, every detail has been carefully considered.',
      'The collection features premium cotton tees, hoodies, and accessories featuring intricate embroidery and high-definition prints that maintain their quality wash after wash.',
      'Whether you are a fan of the Water Breathing techniques or the fierce determination of the Hashira, there is something in this collection for every Demon Slayer enthusiast.',
    ],
    tags: ['demonslayer', 'kimetsu', 'collection', 'anime'],
  },
  4: {
    content: [
      'Jujutsu Kaisen has taken the anime world by storm, and with it comes a wave of incredible merchandise. From Gojo blindfold tees to Sukuna finger rings, there is no shortage of ways to rep your favorite series.',
      'The key to building a great JJK collection is focusing on quality over quantity. Invest in pieces that feature subtle references rather than loud prints for a more versatile wardrobe.',
      'Limited edition collaborations between anime studios and fashion brands have produced some of the most sought-after pieces. Keep an eye on drop dates and act fast when new collections release.',
      'Display your collection with pride. Whether you wear your merch daily or keep it as part of a curated display, Jujutsu Kaisen merchandise is a conversation starter among fellow fans.',
    ],
    tags: ['jjk', 'jujutsukaisen', 'merch', 'gojo'],
  },
  5: {
    content: [
      'The final season of Attack on Titan has arrived, and with it comes our most ambitious collection yet. Inspired by the Survey Corps and the struggle for freedom, each piece tells a story.',
      'Our Attack on Titan collection features the iconic wings of freedom emblem, Scout Regiment insignia, and character-inspired color schemes that pay homage to the series epic narrative.',
      'From rugged jackets that evoke the Survey Corps uniform to subtle tees featuring the show emblem, this collection is designed for fans who want to carry the spirit of the Scout Regiment with them.',
      'Premium materials and attention to detail ensure that each piece not only looks great but stands up to the rigors of daily wear, just like the gear of your favorite characters.',
    ],
    tags: ['aot', 'attackontitan', 'surveycorps', 'finalseason'],
  },
  6: {
    content: [
      'The Naruto Retro Collection takes you back to the early days of the Hidden Leaf Village. Vintage-inspired designs celebrate the journey of Naruto Uzumaki from outcast to hero.',
      'This collection draws inspiration from the original series aesthetic, featuring earthy color palettes, character silhouettes, and iconic symbolography from the world of shinobi.',
      'Each piece is crafted with a worn-in feel that captures the nostalgia of the early 2000s anime era. Distressed prints, retro fonts, and authentic detailing make this collection truly special.',
      'Whether you are a day-one fan or discovered Naruto through Boruto, the Retro Collection offers timeless designs that celebrate the ninja way and the power of never giving up.',
    ],
    tags: ['naruto', 'retro', 'ninja', 'nostalgia'],
  },
}

function BlogDetails() {
  const { t } = useI18n()
  const location = useLocation()
  const post = location.state?.post || fallbackPost
  const details = contentMap[post.id] || contentMap[1]

  const recentPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3)

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
                  <Link to="/blog">{t('blog.title')}</Link>
                  <span>{post.title.length > 30 ? post.title.slice(0, 30) + '...' : post.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-details spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="blog__details__content" style={{
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px solid var(--border-glass)',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: post.gradient,
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
                  }} />
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <i className={`fa ${post.icon}`} style={{ fontSize: 40, color: 'rgba(255,255,255,0.7)' }} />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 30px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                      <i className="fa fa-calendar" style={{ marginRight: 6 }} />
                      {post.date}
                    </span>
                    <h2 style={{ color: '#fff', margin: '8px 0 0', fontSize: 26, lineHeight: 1.3 }}>{post.title}</h2>
                  </div>
                </div>

                <div style={{ padding: '30px' }}>
                  {details.content.map((paragraph, i) => (
                    <p key={i} style={{
                      color: 'var(--text-muted)',
                      fontSize: 15,
                      lineHeight: 1.8,
                      marginBottom: 16,
                    }}>
                      {paragraph}
                    </p>
                  ))}

                  <div style={{
                    marginTop: 30,
                    paddingTop: 20,
                    borderTop: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {details.tags.map(tag => (
                        <span key={tag} style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.2)',
                          color: 'var(--purple-light)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'default',
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['facebook', 'twitter', 'pinterest'].map(social => (
                        <a key={social} href="#" onClick={(e) => e.preventDefault()} style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                          transition: 'all 0.3s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.color = 'var(--purple-light)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                          <i className={`fa fa-${social}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="blog__sidebar" style={{
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px solid var(--border-glass)',
                padding: 24,
              }}>
                <h5 style={{ color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-glass)' }}>
                  <i className="fa fa-clock-o" style={{ marginRight: 8, color: 'var(--purple)' }} />
                  Recent Posts
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentPosts.map(rp => (
                    <Link
                      key={rp.id}
                      to="/blog-details"
                      state={{ post: rp }}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        textDecoration: 'none',
                        padding: 10,
                        borderRadius: 10,
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        background: rp.gradient,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <i className={`fa ${rp.icon}`} style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                          {rp.title.length > 35 ? rp.title.slice(0, 35) + '...' : rp.title}
                        </p>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{rp.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-glass)' }}>
                  <Link to="/blog" className="primary-btn" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: 13 }}>
                    <i className="fa fa-arrow-left" style={{ marginRight: 6 }} />
                    {t('blog.title')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default BlogDetails
