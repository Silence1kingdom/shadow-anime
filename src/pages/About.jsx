import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

function AnimatedNumber({ target, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 2000
        const start = performance.now()
        const animate = (now) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          setCount(Math.floor(progress * target))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

function About() {
  const { t } = useI18n()
  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('about.title')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <span>{t('about.title')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
                <div className="about__pic">
                  <div className="section-title" style={{ textAlign: 'center' }}>
                    <span>{t('about.title')}</span>
                    <h2 style={{ fontSize: '48px' }}>SHADOW ANIME</h2>
                  </div>
                </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div className="about__item">
                <h4>{t('about.whoWeAre')}</h4>
                <p>{t('about.whoWeAreDesc')}</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div className="about__item">
                <h4>{t('about.whatWeDo')}</h4>
                <p>{t('about.whatWeDoDesc')}</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div className="about__item">
                <h4>{t('about.whyChooseUs')}</h4>
                <p>{t('about.whyChooseUsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="counter spad">
        <div className="container">
          <div className="row">
            {[
              { num: 250, label: t('about.ourClients') },
              { num: 50, label: t('about.totalCategories') },
              { num: 15, label: t('about.inCountry') },
              { num: 99, label: t('about.happyCustomer'), suffix: '%' },
            ].map((item, i) => (
              <div key={i} className="col-lg-3 col-md-6 col-sm-6">
                <div className="counter__item">
                  <div className="counter__item__number">
                    <h2 className="cn_num"><AnimatedNumber target={item.num} suffix={item.suffix || ''} /></h2>
                  </div>
                  <span>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default About
