import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, getSettings } from '../utils/siteData'
import { useToast } from './Toast'
import { recommendProducts, estimateSize, estimateBodyType, skinTones, sizeGuideText } from '../utils/recommendationEngine'
import { getAIChatResponse } from '../utils/aiChat'

function isArabic(txt) { return /[\u0600-\u06FF]/.test(txt) }

const quickReplies = {
  en: [
    { label: '👕 For Me', msg: 'Recommend for my body type' },
    { label: '🛍️ Products', msg: 'Show me products' },
    { label: '💰 Prices', msg: 'What are your prices?' },
    { label: '🚚 Shipping', msg: 'Shipping info' },
    { label: '🔥 Best Sellers', msg: 'Recommend popular items' },
    { label: '📞 Contact', msg: 'Contact info' },
  ],
  ar: [
    { label: '👕 اقترح لي', msg: 'اقترحلي حسب جسمي' },
    { label: '🛍️ المنتجات', msg: 'عندك منتجات' },
    { label: '💰 الأسعار', msg: 'الأسعار كام' },
    { label: '🚚 الشحن', msg: 'معلومات الشحن' },
    { label: '🔥 الأكثر مبيعاً', msg: 'نصحني بأفضل المنتجات' },
    { label: '📞 اتصل بنا', msg: 'رقم التواصل' },
  ],
}

const categories = ['T-Shirts', 'Hoodies', 'Accessories']

const greetings = ['hi', 'hello', 'hey', 'hi there', 'good morning', 'good evening', 'hello there', 'hii', 'heyy']
const tyThanks = ['thanks', 'thank', 'thx', 'ty', 'appreciate']
const shipKeywords = ['shipping', 'delivery', 'ship', 'deliver', 'delivery time', 'how long', 'arrive', 'arrived']
const priceKeywords = ['price', 'cost', 'how much', 'prices', 'expensive', 'cheap']
const productKeywords = ['product', 'item', 'merch', 'merchandise', 'clothes', 'hoodie', 'tee', 't-shirt', 'shirt', 'jacket', 'accessories']
const payKeywords = ['pay', 'payment', 'credit', 'card', 'cash', 'vodafone', 'etisalat', 'orange']
const couponKeywords = ['coupon', 'discount', 'promo', 'offer', 'code']
const sizeKeywords = ['size', 'sizes', 'measurement', 'fit']
const contactKeywords = ['contact', 'phone', 'call', 'whatsapp', 'email']
const trackKeywords = ['track', 'order', 'my order', 'where']
const recommendKeywords = ['suggest', 'recommend', 'recommendation', 'what do you', 'best', 'popular', 'favorite']

function getAIResponse(msg, products, settings, lang) {
  const lower = msg.toLowerCase().trim()
  const ar = lang === 'ar'
  const name = settings.siteName || 'Shadow Anime'
  const currency = settings.currency || 'EGP'
  const whatsapp = settings.whatsapp || '+20 104 262 614'
  const email = settings.email || 'vectorblack03@gmail.com'
  const threshold = Number(settings.freeShippingThreshold) || 1000
  const shippingFee = settings.shipping || 50

  if (ar) {
    if (['مرحبا', 'السلام', 'اهلا', 'أهلا', 'هلا'].some(g => lower.includes(g)))
      return { text: `👋 أهلاً بك في ${name}! 😊\n\nأنا المساعد الذكي، أقدر أساعدك في:\n• 🛍️ تصفح المنتجات\n• 💰 الأسعار والعروض\n• 🚚 الشحن والتوصيل\n• 📦 تتبع الطلبات\n\nإيش تبي تسأل؟`, actions: [{ label: '🛍️ تصفح المتجر', action: 'shop' }, { label: '🔥 الأكثر مبيعاً', action: 'recommend' }] }
    if (['شكرا', 'شكر', 'مشكور', 'تسلم'].some(t => lower.includes(t)))
      return { text: '😊 العفو! في أي خدمة ثانية؟', actions: [{ label: '🛍️ المنتجات', action: 'products' }, { label: '🔥 اقتراحات', action: 'recommend' }] }
    if (['تتبع', 'اوردر', 'الطلب', 'وين', 'فين'].some(t => lower.includes(t)))
      return { text: `📦 عشان تتبع طلبك:\n\nروح لصفحة تتبع الطلب وأدخل رقم الطلب اللي وصلك.`, actions: [{ label: '📦 تتبع الآن', action: 'tracking' }] }
    if (['شحن', 'توصيل', 'يوصل', 'وصول'].some(s => lower.includes(s)))
      return { text: `🚚 **معلومات الشحن:**\n• مجاني للطلبات فوق ${currency} ${threshold}\n• التوصيل: ٣-٧ أيام عمل\n• نوصل لكل مصر 🇪🇬`, actions: [{ label: '🛍️ تسوق الآن', action: 'shop' }] }
    if (['دفع', 'فيزا', 'كاش', 'vodafone', 'etisalat'].some(p => lower.includes(p)))
      return { text: `💳 **طرق الدفع المتاحة:**\n• كريدت/دبت كارد\n• PayPal\n• فودافون كاش\n• اتصالات كاش\n• أورانج كاش\n• وي كاش\n\nكلها آمنة ومضمونة ✅` }
    if (['خصم', 'كود', 'كوبون', 'عرض', 'تخفيض'].some(c => lower.includes(c)))
      return { text: `🏷️ **الكوبونات:**\nعندنا أكواد خصم فعالة! استخدمها عند الدفع.\n\nتقدر تشوف العروض في صفحة الكارت.`, actions: [{ label: '🛒 روح للكارت', action: 'cart' }] }
    if (['مقاس', 'قياس', 'القياسات'].some(s => lower.includes(s)))
      return { text: `📏 **دليل المقاسات:**\nS: الصدر ٩١-٩٦ سم\nM: الصدر ٩٧-١٠٢ سم\nL: الصدر ١٠٣-١٠٨ سم\nXL: الصدر ١٠٩-١١٤ سم\n2XL: الصدر ١١٥-١٢٠ سم\n3XL: الصدر ١٢١-١٢٦ سم` }
    if (['اتصال', 'تليفون', 'رقم', 'تواصل', 'ايميل', 'واتس', 'call'].some(c => lower.includes(c)))
      return { text: `📞 **تواصل معنا:**\n• واتساب: ${whatsapp}\n• إيميل: ${email}\n\nنرد خلال ساعات!`, actions: [{ label: '💬 واتساب', action: `wa` }] }
    if (['اقتراح', 'تنصح', 'الأفضل', 'popular', 'recommend'].some(r => lower.includes(r))) {
      const popular = products.filter(p => p.sale).slice(0, 4)
      return { text: `🔥 **أشهر المنتجات حالياً!**\nاختر اللي يعجبك 👇`, suggestProducts: popular.length > 0 ? popular : products.slice(0, 4), actions: [{ label: '🛍️ كل المنتجات', action: 'shop' }] }
    }
    if (['سعر', 'كم', 'كام', 'اسعار'].some(p => lower.includes(p))) {
      if (lower.includes('كل') || lower.includes('اسعار')) {
        const min = Math.min(...products.map(p => Number(p.price)))
        const max = Math.max(...products.map(p => Number(p.price)))
        return { text: `💰 أسعارنا تبدأ من ${currency} ${min} إلى ${currency} ${max}.`, actions: [{ label: '🛍️ تصفح', action: 'shop' }] }
      }
      const cheapest = [...products].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 3)
      return { text: `💲 **أفضل العروض:**`, suggestProducts: cheapest }
    }
    if (['منتج', 'تيشيرت', 'هودي', 'جاكيت', 'اكسسوارات', 'الملابس', 'عندك'].some(w => lower.includes(w))) {
      const matched = products.filter(p => (p.nameAr || '').includes(msg) || p.category.includes(msg))
      if (matched.length > 0) return { text: `🎯 لقيت ${matched.length} منتج:`, suggestProducts: matched.slice(0, 4), actions: [{ label: '🛍️ كل المنتجات', action: 'shop' }] }
    }
    if (['انمي', 'متجر', 'الموقع', 'store'].some(s => lower.includes(s)))
      return { text: `🛍️ **${name}** - متجر الأنمي الأول!\n\nعندنا تشكيلة ضخمة من:\n👕 تيشيرتات\n🧥 هوديات\n🎒 اكسسوارات\n\nكلها مستوحاة من أشهر الأنميات!`, actions: [{ label: '🛍️ تسوق الآن', action: 'shop' }, { label: '🔥 الأكثر مبيعاً', action: 'recommend' }] }
    if (['هودي', 'hoodie'].some(s => lower.includes(s))) {
      const hoodies = products.filter(p => p.category === 'Hoodies').slice(0, 4)
      return { text: `🧥 **الهوديات:**`, suggestProducts: hoodies.length > 0 ? hoodies : products.slice(0, 4) }
    }
    if (['تيشيرت', 'tee', 't-shirt'].some(s => lower.includes(s))) {
      const tees = products.filter(p => p.category === 'T-Shirts').slice(0, 4)
      return { text: `👕 **التيشيرتات:**`, suggestProducts: tees.length > 0 ? tees : products.slice(0, 4) }
    }
    if (['جسمي', 'مقاس', 'طول', 'وزن', 'لون بشرتي'].some(s => lower.includes(s)))
      return { text: `📏 **دليل المقاسات:**\nS: الصدر ٩١-٩٦ سم\nM: الصدر ٩٧-١٠٢ سم\nL: الصدر ١٠٣-١٠٨ سم\nXL: الصدر ١٠٩-١١٤ سم\n2XL: الصدر ١١٥-١٢٠ سم\n3XL: الصدر ١٢١-١٢٦ سم\n\n👕 أبي تقترحلك حسب جسمك؟ اضغط الزر 👇`, actions: [{ label: '👕 اقترح لي', action: 'recommend_body' }] }
    return {
      text: `🤖 أقدر أساعدك في:\n\n🛍️ **تصفح المنتجات**\n💰 **الأسعار والعروض**\n🚚 **الشحن**\n📦 **تتبع الطلب**\n📞 **تواصل معنا**\n\nاختر من الأزرار 👇`,
      actions: [{ label: '🛍️ المتجر', action: 'shop' }, { label: '🔥 الأكثر مبيعاً', action: 'recommend' }, { label: '📞 اتصل بنا', action: 'contact' }],
      suggestProducts: products.slice(0, 2),
      _needsAI: true,
    }
  }

  if (greetings.some(g => lower.includes(g)))
    return { text: `👋 Welcome to ${name}! 😊\n\nI can help you with:\n• 🛍️ Browse products\n• 💰 Prices & deals\n• 🚚 Shipping info\n• 📦 Order tracking\n\nWhat would you like?`, actions: [{ label: '🛍️ Browse Shop', action: 'shop' }, { label: '🔥 Best Sellers', action: 'recommend' }] }
  if (tyThanks.some(t => lower.includes(t)))
    return { text: `😊 You're welcome! Anything else?`, actions: [{ label: '🛍️ Products', action: 'products' }, { label: '🔥 Popular', action: 'recommend' }] }
  if (trackKeywords.some(t => lower.includes(t)))
    return { text: `📦 Track your order by visiting the tracking page with your order ID.`, actions: [{ label: '📦 Track Now', action: 'tracking' }] }
  if (shipKeywords.some(s => lower.includes(s)))
    return { text: `🚚 **Shipping Info:**\n• Free over ${currency} ${threshold}\n• Standard: ${currency} ${shippingFee}\n• 3-7 business days\n\nWe ship across Egypt! 🇪🇬`, actions: [{ label: '🛍️ Shop Now', action: 'shop' }] }
  if (payKeywords.some(p => lower.includes(p)))
    return { text: `💳 **Payment Methods:**\n• Credit/Debit Card\n• PayPal\n• Vodafone Cash\n• Etisalat Cash\n• Orange Cash\n• We Cash\n\nAll secure ✅` }
  if (couponKeywords.some(c => lower.includes(c)))
    return { text: `🏷️ We have active coupon codes! Apply them at checkout.`, actions: [{ label: '🛒 Go to Cart', action: 'cart' }] }
  if (sizeKeywords.some(s => lower.includes(s)))
    return { text: `📏 **Size Guide:**\nS: Chest 91-96cm | M: 97-102cm\nL: 103-108cm | XL: 109-114cm\n2XL: 115-120cm | 3XL: 121-126cm` }
  if (contactKeywords.some(c => lower.includes(c)))
    return { text: `📞 **Contact Us:**\n• WhatsApp: ${whatsapp}\n• Email: ${email}`, actions: [{ label: '💬 WhatsApp', action: `wa` }] }
  if (recommendKeywords.some(r => lower.includes(r))) {
    const popular = products.filter(p => p.sale).slice(0, 4)
    return { text: `🔥 **Our Best Sellers!**`, suggestProducts: popular.length > 0 ? popular : products.slice(0, 4), actions: [{ label: '🛍️ All Products', action: 'shop' }] }
  }
  if (priceKeywords.some(p => lower.includes(p))) {
    if (lower.includes('all') || lower.includes('range')) {
      const min = Math.min(...products.map(p => Number(p.price)))
      const max = Math.max(...products.map(p => Number(p.price)))
      return { text: `💰 Prices from ${currency} ${min} to ${currency} ${max}.`, actions: [{ label: '🛍️ Browse', action: 'shop' }] }
    }
    const cheapest = [...products].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 3)
    return { text: `💲 **Best Value!**`, suggestProducts: cheapest }
  }
  if (productKeywords.some(p => lower.includes(p))) {
    const words = lower.split(' ')
    for (const word of words) {
      if (word.length > 2) {
        const f = products.filter(p => p.name.toLowerCase().includes(word) || (p.nameAr || '').includes(word) || (p.category || '').toLowerCase().includes(word))
        if (f.length > 0) return { text: `🎯 Found ${f.length} product(s):`, suggestProducts: f.slice(0, 4), actions: [{ label: '🛍️ All Products', action: 'shop' }] }
      }
    }
  }
  if (lower.includes('hoodie')) {
    const h = products.filter(p => p.category === 'Hoodies').slice(0, 4)
    return { text: `🧥 **Hoodies:**`, suggestProducts: h.length > 0 ? h : products.slice(0, 4) }
  }
  if (lower.includes('tee') || lower.includes('shirt') || lower.includes('t-shirt')) {
    const t = products.filter(p => p.category === 'T-Shirts').slice(0, 4)
    return { text: `👕 **T-Shirts:**`, suggestProducts: t.length > 0 ? t : products.slice(0, 4) }
  }
  if (lower.includes('anime') || lower.includes('shadow') || lower.includes('store'))
    return { text: `🛍️ **${name}** - Premium anime merch!\n\n• 👕 T-Shirts\n• 🧥 Hoodies\n• 🎒 Accessories\n\nAll inspired by your favorite anime!`, actions: [{ label: '🛍️ Shop Now', action: 'shop' }, { label: '🔥 Best Sellers', action: 'recommend' }] }
  if (['height', 'weight', 'body', 'measurement', 'size', 'fit'].some(s => lower.includes(s)))
    return { text: `📏 **Size Guide:**\nS: Chest 91-96cm\nM: Chest 97-102cm\nL: Chest 103-108cm\nXL: Chest 109-114cm\n2XL: Chest 115-120cm\n3XL: Chest 121-126cm\n\n👕 Want personalized recommendations? 👇`, actions: [{ label: '👕 For Me', action: 'recommend_body' }] }
  return {
    text: `🤖 I can help with:\n\n🛍️ **Browse products**\n💰 **Prices & deals**\n🚚 **Shipping**\n📦 **Track order**\n📞 **Contact us**\n\nChoose below 👇`,
    actions: [{ label: '🛍️ Shop', action: 'shop' }, { label: '🔥 Popular', action: 'recommend' }, { label: '📞 Contact', action: 'contact' }],
    suggestProducts: products.slice(0, 2),
    _needsAI: true,
  }
}

function LiveChat() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(true)
  const [products, setProducts] = useState([])
  const [listening, setListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [typing, setTyping] = useState(false)
  const [userLang, setUserLang] = useState('en')
  const [settings, setSettings] = useState({})
  const [convoStep, setConvoStep] = useState(null)
  const [userBody, setUserBody] = useState({})
  const bottomRef = useRef(null)
  const navigate = useNavigate()
  const timeoutsRef = useRef([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chat_messages')
      if (raw) setMsgs(JSON.parse(raw))
    } catch {}
    try { const stored = localStorage.getItem('chat_user_name'); if (stored) { setName(stored); setShowNamePrompt(false) } } catch {}
    getProducts().then(setProducts)
    getSettings().then(setSettings)
  }, [])

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  useEffect(() => {
    if (!open) return
    const updated = msgs.map(m => m.side === 'admin' ? { ...m, read: true } : m)
    if (updated.some((m, i) => m.read !== msgs[i].read)) {
      setMsgs(updated)
      try { localStorage.setItem('chat_messages', JSON.stringify(updated)) } catch {}
    }
  }, [open])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast('Voice recognition not supported. Try Chrome.', 'warning')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'ar-EG'
    r.continuous = false
    r.interimResults = false
    setListening(true)
    r.onresult = (e) => { setText(prev => prev + e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
  }, [])

  const speak = useCallback((msgId, textToSpeak) => {
    if (speakingId === msgId) { window.speechSynthesis.cancel(); setSpeakingId(null); return }
    window.speechSynthesis.cancel()
    const clean = textToSpeak.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/[^\u0600-\u06FF\u0000-\u007F\s]/g, '')
    const u = new SpeechSynthesisUtterance(clean)
    u.lang = isArabic(clean) ? 'ar-EG' : 'en-US'
    u.rate = 1
    u.onend = () => setSpeakingId(null)
    u.onerror = () => setSpeakingId(null)
    setSpeakingId(msgId)
    window.speechSynthesis.speak(u)
  }, [speakingId])

  const saveName = () => {
    if (!name.trim()) return
    try { localStorage.setItem('chat_user_name', name.trim()) } catch {}
    setShowNamePrompt(false)
    const lang = isArabic(name) ? 'ar' : 'en'
    setUserLang(lang)
    const welcomeText = lang === 'ar'
      ? `أهلاً ${name.trim()}! 👋 أنا مساعدك الذكي. اختر من الأزرار 👇`
      : `Welcome ${name.trim()}! 👋 I'm your AI assistant. Pick from the options 👇`
    const welcome = { from: 'Shadow AI 🤖', text: welcomeText, timestamp: Date.now(), side: 'admin', isAI: true, lang }
    setMsgs([welcome])
    try { localStorage.setItem('chat_messages', JSON.stringify([welcome])) } catch {}
  }

  const send = async (overrideText) => {
    const msgText = overrideText || text
    if (!msgText.trim()) return
    const lang = isArabic(msgText) ? 'ar' : 'en'
    setUserLang(lang)
    const msg = { from: name || 'Guest', text: msgText.trim(), timestamp: Date.now(), side: 'user', lang }
    const updated = [...msgs, msg]
    setMsgs(updated)
    try { localStorage.setItem('chat_messages', JSON.stringify(updated)) } catch {}
    setText('')
    setTyping(true)

    const t = setTimeout(async () => {
      const s = await getSettings()
      setSettings(s)

      if (convoStep) {
        processConvoStep(msgText, lang, s, updated)
        return
      }

      const bodyKeywords = lang === 'ar'
        ? ['جسمي', 'مقاس', 'طول', 'وزن', 'بشرتي', 'لون بشرتي', 'اقترحلي', 'نصحني', 'القياسات']
        : ['body', 'height', 'weight', 'skin', 'measurement', 'fit', 'size']

      const wantsBodyRec = bodyKeywords.some(k => msgText.toLowerCase().includes(k)) ||
        msgText.toLowerCase().includes('recommend for me')

      if (wantsBodyRec) {
        startBodyRecommendation(lang, s, updated)
      } else {
        const ai = getAIResponse(msgText, products, s, lang)
        if (ai._needsAI && s.aiApiKey) {
          try {
            const aiResp = await getAIChatResponse({ message: msgText, products, settings: s, lang, history: msgs.slice(-6) })
            if (aiResp && aiResp.text) {
              setTyping(false)
              const reply = { from: 'Shadow AI 🤖', text: aiResp.text, timestamp: Date.now(), side: 'admin', isAI: true, lang, suggestProducts: [], actions: ai.actions || [] }
              const withReply = [...updated, reply]
              setMsgs(withReply)
              try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
              return
            }
          } catch {}
        }
        setTyping(false)
        const reply = { from: 'Shadow AI 🤖', text: ai.text, timestamp: Date.now(), side: 'admin', isAI: true, lang, suggestProducts: ai.suggestProducts || [], actions: ai.actions || [] }
        const withReply = [...updated, reply]
        setMsgs(withReply)
        try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
      }
    }, 800)
    timeoutsRef.current.push(t)
  }

  const startBodyRecommendation = (lang, s, updated) => {
    setTyping(false)
    const askText = lang === 'ar'
      ? '👕 **اقتراح المنتجات حسب جسمك!**\n\nخليني أساعدك أختار أفضل المنتجات والمقاسات المناسبة لجسمك.\n\n📏 **أدخل طولك بالسنتيمتر** (مثلاً: 175)\nأو قلي "إلغاء"'
      : '👕 **Product Recommendations for Your Body!**\n\nLet me help you find the perfect products and sizes.\n\n📏 **Enter your height in cm** (e.g., 175)\nOr say "cancel" to stop.'
    setConvoStep('asking_height')
    setUserBody({})
    const reply = { from: 'Shadow AI 🤖', text: askText, timestamp: Date.now(), side: 'admin', isAI: true, lang }
    const withReply = [...updated, reply]
    setMsgs(withReply)
    try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
  }

  const processConvoStep = (msgText, lang, s, updated) => {
    setTyping(false)
    const lower = msgText.toLowerCase().trim()
    const isCancel = lang === 'ar'
      ? ['إلغاء', 'لا', 'لفي', 'كمل', 'خلص', 'stop', 'cancel', 'no'].some(c => lower.includes(c))
      : ['cancel', 'stop', 'no', 'exit', 'quit'].some(c => lower.includes(c))

    if (isCancel && convoStep !== 'asking_skin') {
      setConvoStep(null)
      setUserBody({})
      const reply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? '👍 تمام! في حاجة تانية؟' : '👍 Alright! Anything else?', timestamp: Date.now(), side: 'admin', isAI: true, lang, actions: qrToActions(lang) }
      const withReply = [...updated, reply]
      setMsgs(withReply)
      try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
      return
    }

    if (convoStep === 'asking_height') {
      const nums = lower.match(/\d+/)
      if (!nums) {
        const reply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? '❌ لازم تدخل رقم صحيح. مثلاً: 175' : '❌ Please enter a valid number. E.g., 175', timestamp: Date.now(), side: 'admin', isAI: true, lang }
        const withReply = [...updated, reply]
        setMsgs(withReply)
        try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
        return
      }
      setUserBody(prev => ({ ...prev, height: Number(nums[0]) }))
      setConvoStep('asking_weight')
      const reply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? `✅ تم تسجيل الطول: ${nums[0]} سم\n\n⚖️ **أدخل وزنك بالكيلو** (مثلاً: 70)\nأو قلي "إلغاء"` : `✅ Height saved: ${nums[0]} cm\n\n⚖️ **Enter your weight in kg** (e.g., 70)\nOr say "cancel"`, timestamp: Date.now(), side: 'admin', isAI: true, lang }
      const withReply = [...updated, reply]
      setMsgs(withReply)
      try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
      return
    }

    if (convoStep === 'asking_weight') {
      const nums = lower.match(/\d+/)
      if (!nums) {
        const reply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? '❌ لازم تدخل رقم صحيح. مثلاً: 70' : '❌ Please enter a valid number. E.g., 70', timestamp: Date.now(), side: 'admin', isAI: true, lang }
        const withReply = [...updated, reply]
        setMsgs(withReply)
        try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
        return
      }
      setUserBody(prev => ({ ...prev, weight: Number(nums[0]) }))
      setConvoStep('asking_skin')
      const skinOptions = lang === 'ar'
        ? skinTones.map(t => ({ label: `🟤 ${skinToneLabels(t, 'ar')}`, action: `skin_${t}` }))
        : skinTones.map(t => ({ label: `🟤 ${skinToneLabels(t, 'en')}`, action: `skin_${t}` }))
      const reply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? `✅ تم تسجيل الوزن: ${nums[0]} كجم\n\n🎨 **اختار لون بشرتك من الأزرار:**` : `✅ Weight saved: ${nums[0]} kg\n\n🎨 **Choose your skin tone below:**`, timestamp: Date.now(), side: 'admin', isAI: true, lang, actions: skinOptions }
      const withReply = [...updated, reply]
      setMsgs(withReply)
      try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
      return
    }

    if (convoStep === 'asking_skin') {
      const tone = skinTones.find(t => lower.includes(t)) || (lower.includes('skin_') ? lower.replace('skin_', '') : null)
      if (tone) {
        setUserBody(prev => ({ ...prev, skinTone: tone }))
        showRecommendations(lang, s, updated)
      } else {
        const reply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? '❌ اختار لون بشرتك من الأزرار 👆' : '❌ Please choose your skin tone from the buttons above 👆', timestamp: Date.now(), side: 'admin', isAI: true, lang, actions: skinTones.map(t => ({ label: skinToneLabels(t, lang === 'ar' ? 'ar' : 'en'), action: `skin_${t}` })) }
        const withReply = [...updated, reply]
        setMsgs(withReply)
        try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
      }
      return
    }
  }

  const skinToneLabels = (tone, lang) => {
    const map = { fair: { ar: 'فاتحة', en: 'Fair' }, medium: { ar: 'متوسطة', en: 'Medium' }, olive: { ar: 'زيتونية', en: 'Olive' }, dark: { ar: 'غامقة', en: 'Dark' } }
    return map[tone]?.[lang] || tone
  }

  const showRecommendations = (lang, s, updated) => {
    setConvoStep(null)
    const body = userBody
    const result = recommendProducts(products, body)
    const currency = s.currency || 'EGP'
    const sizeText = result.size
      ? lang === 'ar'
        ? `📏 **المقاس المقترح:** ${result.size}${result.sizeNote ? ' (قد تحتاج مقاس أكبر - راجع دليل المقاسات)' : ''}`
        : `📏 **Recommended Size:** ${result.size}${result.sizeNote ? ' (You may need a larger size - check size guide)' : ''}`
      : lang === 'ar' ? '📏 راجع دليل المقاسات للمنتج' : '📏 Check product size guide'
    const toneText = lang === 'ar'
      ? `🎨 **ألوان تناسب بشرتك:** ${result.skinToneInfo.colors.slice(0, 4).join('، ')}`
      : `🎨 **Colors that suit you:** ${result.skinToneInfo.colors.slice(0, 4).join(', ')}`

    const introText = lang === 'ar'
      ? `👕 **اقتراحاتي لك!**\n\n${sizeText}\n${toneText}\n\nاختر المنتج اللي يعجبك 👇`
      : `👕 **My Recommendations for You!**\n\n${sizeText}\n${toneText}\n\nPick what you like 👇`

    const intro = { from: 'Shadow AI 🤖', text: introText, timestamp: Date.now(), side: 'admin', isAI: true, lang }
    const withIntro = [...updated, intro]
    setMsgs(withIntro)

    const t1 = setTimeout(() => {
      const productsMsg = { from: 'Shadow AI 🤖', text: lang === 'ar' ? '✨ **أفضل المنتجات لك:**' : '✨ **Best products for you:**', timestamp: Date.now() + 1, side: 'admin', isAI: true, lang, suggestProducts: result.recommendations.map(p => ({
        ...p,
        _recSize: p.recommendedSize,
      })) }
      setMsgs(prev => [...prev, productsMsg])
      try {
        const all = [...updated, intro, productsMsg]
        localStorage.setItem('chat_messages', JSON.stringify(all))
      } catch {}
    }, 500)
    timeoutsRef.current.push(t1)

    const doneReply = { from: 'Shadow AI 🤖', text: lang === 'ar' ? '🤖 **تقدر تطلب حاجة تانية:**' : '🤖 **Ask me anything else:**', timestamp: Date.now() + 2, side: 'admin', isAI: true, lang, actions: qrToActions(lang) }
    const t2 = setTimeout(() => {
      setMsgs(prev => [...prev, doneReply])
      try {
        const all = JSON.parse(localStorage.getItem('chat_messages') || '[]')
        all.push(doneReply)
        localStorage.setItem('chat_messages', JSON.stringify(all))
      } catch {}
    }, 1000)
    timeoutsRef.current.push(t2)
  }

  const qrToActions = (lang) => {
    const list = lang === 'ar' ? quickReplies.ar : quickReplies.en
    return list.map(q => ({ label: q.label, action: 'custom_' + q.msg }))
  }

  const handleAction = (action) => {
    if (action === 'shop') { navigate('/shop'); setOpen(false) }
    else if (action === 'tracking') { navigate('/tracking'); setOpen(false) }
    else if (action === 'cart') { navigate('/shopping-cart'); setOpen(false) }
    else if (action === 'recommend') { send(userLang === 'ar' ? 'نصحني بأفضل المنتجات' : 'Recommend popular items') }
    else if (action === 'products') { send(userLang === 'ar' ? 'عندك منتجات' : 'Show me products') }
    else if (action === 'contact') { send(userLang === 'ar' ? 'رقم التواصل' : 'Contact info') }
    else if (action === 'recommend_body') { send(userLang === 'ar' ? 'اقترحلي حسب جسمي' : 'Recommend for my body type') }
    else if (action.startsWith('skin_')) {
      const tone = action.replace('skin_', '')
      const lang = userLang
      setUserBody(prev => ({ ...prev, skinTone: tone }))
      setConvoStep(null)
      getSettings().then(s => showRecommendationsWith(tone, lang, s))
    }
    else if (action.startsWith('custom_')) {
      send(action.replace('custom_', ''))
    }
    else if (action.startsWith('wa')) {
      getSettings().then(s => {
        window.open(`https://wa.me/${(s.whatsapp || '+20104262614').replace(/[^0-9]/g, '')}`, '_blank')
      })
    }
  }

  const showRecommendationsWith = (tone, lang, s) => {
    const body = { ...userBody, skinTone: tone }
    const result = recommendProducts(products, body)
    const currency = s.currency || 'EGP'
    const sizeText = result.size
      ? lang === 'ar'
        ? `📏 **المقاس المقترح:** ${result.size}${result.sizeNote ? ' (قد تحتاج مقاس أكبر)' : ''}`
        : `📏 **Recommended Size:** ${result.size}${result.sizeNote ? ' (may need larger)' : ''}`
      : ''
    const toneText = lang === 'ar'
      ? `🎨 **ألوان تناسب بشرتك:** ${result.skinToneInfo.colors.slice(0, 4).join('، ')}`
      : `🎨 **Colors that suit you:** ${result.skinToneInfo.colors.slice(0, 4).join(', ')}`
    const text = lang === 'ar'
      ? `👕 **اقتراحاتي لك!**\n\n${sizeText}\n${toneText}\n\nاختر المنتج اللي يعجبك 👇`
      : `👕 **My Recommendations!**\n\n${sizeText}\n${toneText}\n\nPick what you like 👇`
    const reply = { from: 'Shadow AI 🤖', text, timestamp: Date.now(), side: 'admin', isAI: true, lang, suggestProducts: result.recommendations }
    const withReply = [...msgs, reply]
    setMsgs(withReply)
    try { localStorage.setItem('chat_messages', JSON.stringify(withReply)) } catch {}
  }

  const unread = msgs.filter(m => m.side === 'admin' && !m.read).length

  const renderMsg = (m) => {
    const hasHTML = typeof m.text === 'string' && (m.text.includes('<a ') || m.text.includes('<br>'))
    const sanitized = hasHTML ? m.text.replace(/href=["']javascript:[^"']*["']/gi, 'href="#"') : m.text
    return (
      <div key={m.timestamp} style={{
        alignSelf: m.side === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%',
        padding: '10px 14px', borderRadius: 12,
        background: m.side === 'user' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
        border: m.side === 'admin' ? '1px solid var(--border-glass)' : 'none',
        animation: 'msgIn 0.3s ease',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{m.from}</span><span>·</span>
          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {m.side === 'admin' && (
            <button onClick={() => speak(m.timestamp, m.text)}
              title={speakingId === m.timestamp ? 'Stop' : 'Read aloud'}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: speakingId === m.timestamp ? 'var(--purple)' : 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: '2px 4px' }}>
              <i className={`fa ${speakingId === m.timestamp ? 'fa-stop-circle' : 'fa-volume-up'}`} />
            </button>
          )}
        </div>
        <div style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', direction: m.lang === 'ar' ? 'rtl' : 'ltr', textAlign: m.lang === 'ar' ? 'right' : 'left' }}
          dangerouslySetInnerHTML={hasHTML ? { __html: sanitized } : undefined}>
          {hasHTML ? null : m.text}
        </div>

        {m.suggestProducts && m.suggestProducts.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {m.suggestProducts.map(p => (
              <div key={p.id} onClick={() => { navigate(`/shop-details?id=${p.id}`, { state: { product: p } }); setOpen(false) }}
                style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'rgba(139,92,246,0.08)', cursor: 'pointer', border: '1px solid rgba(139,92,246,0.15)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.transform = 'translateX(0)' }}>
                <img src={p.image || p.img} alt={p.name} loading="lazy" decoding="async" style={{ width: 46, height: 46, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nameAr || p.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    <span style={{ color: 'var(--purple-light)', fontSize: 12, fontWeight: 700 }}>{(settings && settings.currency) || 'EGP'} {p.price}</span>
                    {p._recSize && <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.1)', padding: '1px 6px', borderRadius: 4 }}>Size: {p._recSize}</span>}
                    {p.recommendedSize && <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.1)', padding: '1px 6px', borderRadius: 4 }}>Size: {p.recommendedSize}</span>}
                  </div>
                </div>
                <i className="fa fa-chevron-right" style={{ color: 'var(--text-muted)', fontSize: 12 }} />
              </div>
            ))}
          </div>
        )}

        {m.actions && m.actions.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {m.actions.map((a, i) => (
              <button key={i} onClick={() => handleAction(a.action)}
                style={{ padding: '6px 14px', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, background: 'rgba(139,92,246,0.1)', color: 'var(--purple-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; e.currentTarget.style.color = '#c4b5fd' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = 'var(--purple-light)' }}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const qr = userLang === 'ar' ? quickReplies.ar : quickReplies.en

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 24, left: 24, zIndex: 9998,
        width: 56, height: 56, borderRadius: '50%', border: 'none',
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        color: '#fff', fontSize: 24, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className={`fa ${open ? 'fa-times' : 'fa-commenting'}`} />
        {unread > 0 && !open && (
          <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--rose)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 90, left: 24, zIndex: 9998,
          width: 370, maxWidth: 'calc(100vw - 48px)',
          background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 140px)',
        }}>
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span><i className="fa fa-robot" style={{ marginRight: 8 }} />AI Assistant</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { if (confirm('Clear all messages?')) { setMsgs([]); try { localStorage.removeItem('chat_messages') } catch {} } }}
                title="Clear chat" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa fa-trash" />
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}><i className="fa fa-times" /></button>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
            background: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.03), transparent)',
          }}>
            {showNamePrompt ? (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10 }}>Hi! Enter your name to start / أدخل اسمك للبدء</p>
                <input value={name} onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Your name / اسمك" onKeyDown={e => e.key === 'Enter' && saveName()} />
                <button onClick={saveName} style={{ marginTop: 10, padding: '8px 20px', border: 'none', borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <i className="fa fa-commenting" style={{ marginRight: 6 }} />Start / ابدأ
                </button>
              </div>
            ) : (
              <>
                {msgs.map(renderMsg)}
                {typing && (
                  <div style={{ alignSelf: 'flex-start', padding: '10px 16px', borderRadius: 12, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', animation: 'bounce 1.2s infinite', animationDelay: '0s' }} />
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', animation: 'bounce 1.2s infinite', animationDelay: '0.2s' }} />
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', animation: 'bounce 1.2s infinite', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {!showNamePrompt && (
            <>
              <div style={{ padding: '6px 12px', display: 'flex', flexWrap: 'wrap', gap: 4, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {qr.map((q, i) => (
                  <button key={i} onClick={() => send(q.msg)}
                    style={{ padding: '4px 10px', borderRadius: 12, border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = 'var(--purple-light)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-glass)' }}>
                    {q.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={startListening} disabled={listening}
                  title={listening ? 'Listening...' : 'Voice input'}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: listening ? 'var(--rose)' : 'var(--border-glass)', color: listening ? '#fff' : 'var(--text-secondary)', fontSize: 15, cursor: listening ? 'not-allowed' : 'pointer', flexShrink: 0, transition: 'all 0.3s', animation: listening ? 'pulse 1s infinite' : 'none' }}>
                  <i className={`fa ${listening ? 'fa-microphone-slash' : 'fa-microphone'}`} />
                </button>
                <input value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                  placeholder={listening ? '🎤 Listening...' : 'Ask me anything... / اسألني...'} />
                <button onClick={() => send()}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>
                  <i className="fa fa-send" />
                </button>
              </div>
            </>
          )}

          <style>{`
            @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
            @keyframes bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }
            @keyframes msgIn { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: translateY(0) } }
          `}</style>

          <div style={{ padding: '5px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center', fontSize: 10, color: '#475569' }}>
            🤖 AI · 🎤 Speak · 🔊 Tap speaker
          </div>
        </div>
      )}
    </>
  )
}

export default LiveChat
