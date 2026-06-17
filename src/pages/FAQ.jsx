import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

const faqs = [
  { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit Cards, PayPal, Vodafone Cash, Etisalat Cash, Orange Cash, and We Cash. All payments are secure.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3-7 business days within Egypt. Free shipping is available for orders over EGP 1,000.' },
  { q: 'Can I track my order?', a: 'Yes! Once your order is placed, you can track it from your profile page or the tracking page using your order ID.' },
  { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery. Items must be unworn with tags attached. Contact us to initiate a return.' },
  { q: 'How do I use a coupon code?', a: 'Enter your coupon code at checkout in the "Coupon code" field and click Apply. The discount will be applied instantly.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within Egypt only. International shipping may be available soon.' },
  { q: 'How can I contact support?', a: 'You can reach us via WhatsApp or email. Visit our Contact page for details. We respond within hours.' },
  { q: 'Can I cancel my order?', a: 'Orders in "Pending" or "Packing" status can be cancelled from your profile page. Once shipped, cancellation is not possible.' },
]

const arFaqs = [
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل البطاقات الائتمانية، PayPal، فودافون كاش، اتصالات كاش، أورانج كاش، ووي كاش. جميع المدفوعات آمنة.' },
  { q: 'كم تستغرق الشحن؟', a: 'الشحن العادي يستغرق ٣-٧ أيام عمل داخل مصر. الشحن مجاني للطلبات فوق ١٠٠٠ جنيه.' },
  { q: 'هل أستطيع تتبع طلبي؟', a: 'نعم! بعد تأكيد الطلب، تقدر تتتبعه من صفحة الملف الشخصي أو صفحة التتبع باستخدام رقم الطلب.' },
  { q: 'ما هي سياسة الاسترجاع؟', a: 'نقبل الاسترجاع خلال ١٤ يوم من التوصيل. القطع يجب أن تكون غير مستعملة مع التاجات. تواصل معنا لبدء الإجراء.' },
  { q: 'كيف أستخدم كود الخصم؟', a: 'أدخل كود الخصم في صفحة الدفع في حقل "كود الخصم" واضغط Apply. الخصم هيتم تطبيقه فوراً.' },
  { q: 'هل تشحنون دولياً؟', a: 'حالياً نشحن داخل مصر فقط. الشحن الدولي هيبدأ قريباً إن شاء الله.' },
  { q: 'كيف أتواصل مع الدعم؟', a: 'تقدر تتواصل معانا عبر واتساب أو إيميل. زر صفحة الاتصال بنا للتفاصيل. بنرد خلال ساعات.' },
  { q: 'هل أقدر ألغي طلبي؟', a: 'الطلبات بحالة "قيد الانتظار" أو "قيد التجهيز" تقدر تلغيها من صفحة الملف الشخصي. بعد الشحن، لا يمكن الإلغاء.' },
]

function FAQ() {
  const { t, lang, setLang } = useI18n()
  const [openIdx, setOpenIdx] = useState(null)
  const items = lang === 'ar' ? arFaqs : faqs

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>{t('nav.faqs')}</h4>
                <div className="breadcrumb__links">
                  <Link to="/">{t('nav.home')}</Link>
                  <span>{t('nav.faqs')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="spad">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: 'var(--purple)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>{t('nav.faqs')}</span>
            <h2 style={{ color: 'var(--text-primary)', marginTop: 8 }}>{lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'كل ما تحتاج معرفته' : 'Everything you need to know'}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              <button onClick={() => setLang('en')} style={{
                padding: '6px 16px', borderRadius: 20, border: lang === 'en' ? '2px solid var(--purple)' : '1px solid var(--border-glass)',
                background: lang === 'en' ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: lang === 'en' ? 'var(--purple)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>🇬🇧 English</button>
              <button onClick={() => setLang('ar')} style={{
                padding: '6px 16px', borderRadius: 20, border: lang === 'ar' ? '2px solid var(--purple)' : '1px solid var(--border-glass)',
                background: lang === 'ar' ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: lang === 'ar' ? 'var(--purple)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>🇪🇬 العربية</button>
            </div>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((faq, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
              }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <div style={{
                  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  color: 'var(--text-primary)', fontWeight: 600, fontSize: 15,
                }}>
                  <span>{faq.q}</span>
                  <i className={`fa fa-chevron-${openIdx === i ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: 12, transition: 'transform 0.3s' }} />
                </div>
                {openIdx === i && (
                  <div style={{ padding: '0 20px 16px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, animation: 'fadeIn 0.3s ease' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        </div>
      </section>
    </>
  )
}

export default FAQ
