import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { getSiteSettings, addSubscriber, getSubscribers } from '../supabase/data'

function Footer() {
  const { t } = useI18n()
  const [settings, setSettings] = useState({})
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState('')

  useEffect(() => { getSiteSettings().then(setSettings) }, [])

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    try {
      const list = await getSubscribers()
      if (list.find(s => s.email === newsletterEmail.trim())) {
        setNewsletterMsg(t('footer.alreadySubscribed', 'Already subscribed!'))
      } else {
        await addSubscriber(newsletterEmail.trim())
        setNewsletterMsg(t('footer.subscribed', 'Thanks for subscribing!'))
      }
    } catch {
      setNewsletterMsg(t('footer.error', 'Something went wrong'))
    }
    setNewsletterEmail('')
    setTimeout(() => setNewsletterMsg(''), 3000)
  }
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="footer__about">
              <div className="footer__logo">
                <Link to="/" className="logo">SHADOW <span>ANIME</span></Link>
              </div>
              <p>{t('footer.tagline')}</p>
            </div>
          </div>
          <div className="col-lg-2 offset-lg-1 col-md-3 col-sm-6">
            <div className="footer__widget">
              <h6>{t('footer.shopping')}</h6>
              <ul>
                <li><Link to="/shop">{t('footer.clothing')}</Link></li>
                <li><Link to="/shop">{t('footer.trending')}</Link></li>
                <li><Link to="/shop">{t('footer.accessories')}</Link></li>
                <li><Link to="/shop">{t('footer.sale')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <div className="footer__widget">
              <h6>{t('footer.help')}</h6>
              <ul>
                <li><Link to="/contact">{t('footer.contactUs')}</Link></li>
                <li><Link to="/checkout">{t('footer.payment')}</Link></li>
                <li><Link to="/tracking">{t('footer.delivery')}</Link></li>
                <li><Link to="/contact">{t('footer.returns')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 offset-lg-1 col-md-6 col-sm-6">
            <div className="footer__widget">
              <h6>{t('footer.newsletter')}</h6>
              <div className="footer__newslatter">
                <p>{t('footer.newsletterDesc')}</p>
                <form action="#" onSubmit={handleNewsletter}>
                  <input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} placeholder={t('footer.yourEmail')} required />
                  <button type="submit"><span className="icon_mail_alt"></span></button>
                </form>
                {newsletterMsg && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 8 }}>{newsletterMsg}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 text-center">
            <div className="footer__copyright__text">
              <p>Copyright &copy; {new Date().getFullYear()} {settings.siteName || 'Shadow Anime'}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
