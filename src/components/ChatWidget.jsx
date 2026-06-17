import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../context/I18nContext'

const autoReplies = [
  { keywords: ['hi', 'hello', 'hey', 'مرحبا', 'السلام'], reply: 'Hello! Welcome to Shadow Anime. How can I help you today?' },
  { keywords: ['order', 'طلب', 'ordering', 'place'], reply: 'To place an order, browse our shop, add items to your cart, and proceed to checkout.' },
  { keywords: ['size', 'مقاس', 'fit'], reply: 'We have a detailed Size Guide on each product page — just click the "Size Guide" button next to the size selector.' },
  { keywords: ['shipping', 'شحن', 'delivery', 'توصيل'], reply: 'We offer free shipping on orders over 1,000 EGP. Delivery usually takes 3-7 business days.' },
  { keywords: ['return', 'إرجاع', 'refund', 'استرجاع'], reply: 'We have a 30-day return policy. If you are not satisfied, contact us and we will help.' },
  { keywords: ['payment', 'دفع', 'pay'], reply: 'We accept cash on delivery and online payment via card. All transactions are secure.' },
  { keywords: ['cancel', 'إلغاء'], reply: 'You can cancel your order from the Profile page while the status is still Pending or Packing.' },
  { keywords: ['discount', 'خصم', 'coupon', 'كوبون'], reply: 'Apply coupon codes at checkout. Follow us on social media for exclusive deals!' },
  { keywords: ['track', 'تتبع', 'tracking'], reply: 'You can track your order status from the Profile page under "My Orders" or use the Tracking page.' },
  { keywords: ['contact', 'اتصال', 'support'], reply: 'You can reach us via the Contact page or email us at support@shadowanime.com.' },
]

function getReply(msg) {
  const lower = msg.toLowerCase()
  for (const item of autoReplies) {
    if (item.keywords.some(k => lower.includes(k))) return item.reply
  }
  return null
}

const defaultMessages = [
  { from: 'bot', text: 'Hi! Welcome to Shadow Anime. Ask me anything about orders, sizes, shipping, or returns.' },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(defaultMessages)
  const [input, setInput] = useState('')
  const [unread, setUnread] = useState(1)
  const endRef = useRef(null)
  const { t, lang } = useI18n()

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => { if (open) setUnread(0) }, [open])

  const send = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { from: 'user', text: input.trim() }
    const all = [...messages, userMsg]
    setMessages(all)
    setInput('')
    setTimeout(() => {
      const reply = getReply(input.trim())
      setMessages(prev => [...prev, { from: 'bot', text: reply || 'Thanks for your message! Our team will get back to you soon.' }])
    }, 500 + Math.random() * 1000)
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
        width: 56, height: 56, borderRadius: '50%', border: 'none',
        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        color: '#fff', fontSize: 24, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className={`fa ${open ? 'fa-times' : 'fa-commenting'}`} />
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: -4, right: -4, width: 20, height: 20,
            borderRadius: '50%', background: '#e53637', color: '#fff',
            fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 90, left: 24, zIndex: 9999,
          width: 340, maxWidth: 'calc(100vw - 48px)',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-glass)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s ease',
        }}>
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              <i className="fa fa-headphones" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t('chat.title', 'Live Chat')}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{t('chat.online', 'We usually reply in minutes')}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1,
            }}>
              <i className="fa fa-minus" />
            </button>
          </div>

          <div style={{
            flex: 1, padding: 16, maxHeight: 320, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                maxWidth: '80%', alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                padding: '10px 14px', borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.from === 'user' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'var(--bg-glass)',
                color: msg.from === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} style={{
            display: 'flex', gap: 8, padding: '12px 16px',
            borderTop: '1px solid var(--border-glass)',
          }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder={t('chat.placeholder', 'Type a message...')}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              }} />
            <button type="submit" style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa fa-send" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
