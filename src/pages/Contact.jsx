import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { useToast } from '../components/Toast'
import { addContactMessage } from '../utils/siteData'

function Contact() {
  const { t } = useI18n()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast('Please fill in all fields.', 'error')
      return
    }
    try {
      await addContactMessage({ ...form, subject: 'Contact Form' })
    } catch {}
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('contact.title')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">Home</Link>
                  <span>{t('contact.title')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="contact__text">
                <div className="section-title">
                  <span>{t('contact.information')}</span>
                  <h2>{t('contact.title')}</h2>
                  <p>{t('contact.desc')}</p>
                </div>
                <ul>
                  <li>
                    <h4>{t('contact.egypt')}</h4>
                    <p>{t('contact.address')}</p>
                  </li>
                  <li>
                    <h4>Phone</h4>
                    <p>
                      <a href="tel:+20104262614" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>
                        <i className="fa fa-whatsapp" style={{ marginRight: 8, color: '#22c55e' }} />+20 104 262 614
                      </a>
                    </p>
                  </li>
                  <li>
                    <h4>{t('contact.email')}</h4>
                    <p>
                      <a href="mailto:vectorblack03@gmail.com" style={{ color: 'var(--purple-light)', textDecoration: 'none' }}>
                        <i className="fa fa-envelope" style={{ marginRight: 8 }} />vectorblack03@gmail.com
                      </a>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="contact__form">
                <form action="#" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-6">
                      <input type="text" placeholder={t('contact.namePlaceholder')}
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="col-lg-6">
                      <input type="text" placeholder={t('contact.emailPlaceholder')}
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="col-lg-12">
                      <textarea placeholder={t('contact.messagePlaceholder')}
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                      <button type="submit" className="site-btn">
                        {sent ? <><i className="fa fa-check" style={{ marginRight: 6 }} />Message Sent!</> : t('contact.sendMessage')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
