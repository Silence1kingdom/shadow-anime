import { db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const defaultProducts = [
  { id: 1, img: '/img/products/anime-tee-1.jpg', name: 'Tanjiro Tee', nameAr: 'تيشيرت تانجيرو', price: 420, sale: false, category: 'T-Shirts', description: 'Premium quality anime t-shirt featuring Tanjiro from Demon Slayer.', stock: 20, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 2, img: '/img/products/anime-tee-2.jpg', name: 'Gojo Hoodie', nameAr: 'هودي جوجو', price: 589, sale: true, category: 'Hoodies', description: 'Comfortable Gojo-inspired hoodie with cozy fleece lining.', stock: 15, sizes: ['M', 'L', 'XL', '2XL'] },
  { id: 3, img: '/img/products/anime-tee-3.jpg', name: 'Kakashi Jacket', nameAr: 'جاكيت كاكاشي', price: 670, sale: false, category: 'T-Shirts', description: 'Sleek Kakashi-themed jacket for everyday wear.', stock: 10, sizes: ['S', 'M', 'L', 'XL', '2XL'] },
  { id: 4, img: '/img/products/ff-tee.jpg', name: 'Final Fantasy Tee', nameAr: 'تيشيرت فاينال فانتازي', price: 450, sale: true, category: 'T-Shirts', description: 'Limited edition Final Fantasy graphic tee.', stock: 25, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 5, img: '/img/products/graphic-tee.jpg', name: 'Urban Graphic Tee', nameAr: 'تيشيرت جرافيك', price: 390, sale: false, category: 'T-Shirts', description: 'Streetwear-inspired anime graphic tee.', stock: 30, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 6, img: '/img/products/onair-tee.jpg', name: 'Oversized Anime Tee', nameAr: 'تيشيرت أنمي كبير', price: 420, sale: false, category: 'T-Shirts', description: 'Comfortable oversized fit with anime print.', stock: 18, sizes: ['M', 'L', 'XL'] },
  { id: 7, img: '/img/products/white-hoodie.jpg', name: 'White Anime Hoodie', nameAr: 'هودي أنمي أبيض', price: 720, sale: true, category: 'Hoodies', description: 'Clean white hoodie with minimalist anime design.', stock: 12, sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
  { id: 8, img: '/img/products/three-tees.jpg', name: 'Anime Tee Bundle', nameAr: 'باقة تيشيرتات أنمي', price: 990, sale: false, category: 'T-Shirts', description: 'Bundle of 3 premium anime graphic tees.', stock: 8, sizes: ['M', 'L', 'XL'] },
  { id: 9, img: '/img/products/asuka.jpg', name: 'Asuka Tee', nameAr: 'تيشيرت أسوكا', price: 480, sale: false, category: 'T-Shirts', description: 'Evangelion-inspired Asuka Langley graphic tee.', stock: 22, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 10, img: '/img/products/gogeta.jpg', name: 'Dragon Ball Hoodie', nameAr: 'هودي دراجون بول', price: 650, sale: true, category: 'Hoodies', description: 'Dragon Ball inspired hoodie featuring Gogeta.', stock: 14, sizes: ['M', 'L', 'XL', '2XL'] },
  { id: 11, img: '/img/products/cyberpunk-girl.jpg', name: 'Cyberpunk Tee', nameAr: 'تيشيرت سايبربانك', price: 380, sale: false, category: 'T-Shirts', description: 'Neon cyberpunk aesthetic anime tee.', stock: 28, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 12, img: '/img/products/cosplay-girl.jpg', name: 'Cosplay Hoodie', nameAr: 'هودي كوسبلاي', price: 850, sale: false, category: 'Hoodies', description: 'Premium cosplay-inspired zip hoodie.', stock: 9, sizes: ['M', 'L', 'XL', '2XL', '3XL'] },
  { id: 13, img: '/img/products/neon-woman.jpg', name: 'Neon Cap', nameAr: 'قبعة نيون', price: 290, sale: true, category: 'Accessories', description: 'Stylish neon anime-inspired cap.', stock: 35, sizes: [] },
  { id: 14, img: '/img/products/anime-tee-1.jpg', name: 'Naruto Headband', nameAr: 'عصبة ناروتو', price: 190, sale: false, category: 'Accessories', description: 'Authentic ninja headband from Hidden Leaf.', stock: 40, sizes: [] },
  { id: 15, img: '/img/products/anime-tee-2.jpg', name: 'Anime Keychain Set', nameAr: 'طقم مفاتيح أنمي', price: 150, sale: false, category: 'Accessories', description: 'Set of 5 anime character keychains.', stock: 50, sizes: [] },
  { id: 16, img: '/img/products/anime-tee-3.jpg', name: 'Poster Collection', nameAr: 'مجموعة بوسترات', price: 250, sale: true, category: 'Accessories', description: 'Set of 3 A3 anime posters.', stock: 20, sizes: [] },
  { id: 17, img: '/img/products/ff-tee.jpg', name: 'Phone Case', nameAr: 'جراب موبايل', price: 210, sale: false, category: 'Accessories', description: 'Anime-inspired phone case for most models.', stock: 45, sizes: [] },
]

const defaultBlogPosts = [
  { id: 1, title: 'Top 10 Anime Fashion Trends in 2026', titleAr: '', date: '2026-02-16', img: '', gradient: 'linear-gradient(135deg, #1a0533 0%, #8b5cf6 100%)', icon: 'fa-tags', excerpt: 'From Demon Slayer inspired Haori jackets to Jujutsu Kaisen hoodies, discover the top anime fashion trends dominating 2026.', content: 'Anime fashion has taken the world by storm, blending streetwear with beloved characters and creating a unique cultural phenomenon that shows no signs of slowing down.' },
  { id: 2, title: 'How to Style Your Anime Hoodie', titleAr: '', date: '2026-02-21', img: '', gradient: 'linear-gradient(135deg, #0a1a33 0%, #06b6d4 100%)', icon: 'fa-tshirt', excerpt: 'Learn how to rock your favorite anime hoodie with these streetwear styling tips.', content: 'Anime hoodies have become a staple in streetwear fashion, offering a perfect blend of comfort and fandom expression.' },
  { id: 3, title: 'Demon Slayer: The New Collection', titleAr: '', date: '2026-02-28', img: '', gradient: 'linear-gradient(135deg, #1a0533 0%, #e53637 100%)', icon: 'fa-fire', excerpt: 'Our latest Demon Slayer collection is here. Featuring Tanjiro and friends.', content: 'The Demon Slayer phenomenon continues to inspire our latest collection, bringing the world of Kimetsu no Yaiba to your wardrobe.' },
  { id: 4, title: 'Jujutsu Kaisen Merch Guide', titleAr: '', date: '2026-03-05', img: '', gradient: 'linear-gradient(135deg, #0a0533 0%, #7c3aed 100%)', icon: 'fa-diamond', excerpt: 'The ultimate guide to Jujutsu Kaisen merchandise.', content: 'Jujutsu Kaisen has taken the anime world by storm, and our merchandise collection captures the essence of your favorite sorcerers.' },
  { id: 5, title: 'Attack on Titan Final Season Gear', titleAr: '', date: '2026-03-12', img: '', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #dc2626 100%)', icon: 'fa-shield', excerpt: 'Gear up for the final season with our exclusive Attack on Titan collection.', content: 'The final season of Attack on Titan brings our most epic collection yet, featuring the Survey Corps and more.' },
  { id: 6, title: 'Naruto Retro Collection Drop', titleAr: '', date: '2026-03-19', img: '', gradient: 'linear-gradient(135deg, #1a1a0a 0%, #f59e0b 100%)', icon: 'fa-star', excerpt: 'The Naruto Retro Collection is here! Vintage-inspired designs.', content: 'The Naruto Retro Collection takes you back to the early days of the Hidden Leaf with vintage-inspired designs.' },
]

const defaultSettings = {
  siteName: 'SHADOW ANIME',
  siteName_ar: 'شادو أنمي',
  currency: 'EGP',
  shipping: '50',
  freeShippingThreshold: '1000',
  tagline: 'Premium anime-inspired fashion',
  tagline_ar: 'أزياء أنمي راقية',
  description: 'The customer is at the heart of our unique business model.',
  description_ar: 'العميل هو قلب نموذج أعمالنا الفريد.',
  address: 'Cairo, Egypt',
  address_ar: 'القاهرة، مصر',
  phone: '+20 104 262 614',
  email: 'vectorblack03@gmail.com',
  whatsapp: '+20104262614',
  hero_title: 'Anime Fashion Reborn',
  hero_title_ar: 'موضة الأنمي من جديد',
  hero_subtitle: 'Discover premium anime-inspired streetwear that brings your favorite characters to life.',
  hero_subtitle_ar: 'اكتشف أزياء الشارع المستوحاة من الأنمي التي تحيي شخصياتك المفضلة.',
}

const defaultColors = {
  primary: '#8b5cf6',
  accent: '#06b6d4',
  bg: '#0a0a0f',
  text: '#f1f5f9',
  muted: '#94a3b8',
  cardBg: 'rgba(255,255,255,0.03)',
  borderColor: 'rgba(255,255,255,0.06)',
}

const defaultSocial = {
  facebook: 'https://facebook.com/shadowanime',
  twitter: 'https://twitter.com/shadowanime',
  instagram: 'https://instagram.com/shadowanime',
  pinterest: 'https://pinterest.com/shadowanime',
  youtube: '',
  tiktok: '',
}

function lsGet(key, defaults) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(defaults)) {
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaults
      }
      return { ...defaults, ...parsed }
    }
  } catch {}
  return defaults
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const FS = 'data'

async function fsRead(key, defaults) {
  try {
    const snap = await getDoc(doc(db, FS, key))
    if (snap.exists()) return snap.data().items
  } catch {}
  return lsGet(key, defaults)
}

async function fsWrite(key, items) {
  lsSet(key, items)
  try { await setDoc(doc(db, FS, key), { items }) } catch {}
}

/* ─── Products ─── */
export async function getProducts() {
  const raw = await fsRead('admin_products', defaultProducts)
  const list = Array.isArray(raw) && raw.length > 0 ? raw : defaultProducts
  return list.map((p) => ({
    ...p,
    id: p.id != null ? p.id : Math.max(0, ...defaultProducts.map(d => d.id)) + 1,
    image: p.image != null && p.image !== '' ? p.image : (p.img || ''),
    price: Number(p.price) || 0,
    sizes: Array.isArray(p.sizes) ? p.sizes : undefined,
    gallery: Array.isArray(p.gallery) ? p.gallery : undefined,
  }))
}
export async function addProduct(product) {
  const list = await fsRead('admin_products', defaultProducts)
  const nextId = Math.max(...list.map(p => p.id || 0), 0) + 1
  const item = { ...product, id: nextId }
  list.push(item)
  await fsWrite('admin_products', list)
  return item
}
export async function updateProduct(id, updates) {
  const list = await fsRead('admin_products', defaultProducts)
  const idx = list.findIndex(p => p.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates }
  await fsWrite('admin_products', list)
  return list[idx]
}
export async function deleteProduct(id) {
  const list = await fsRead('admin_products', defaultProducts)
  await fsWrite('admin_products', list.filter(p => p.id !== id))
}
export async function saveProduct(updated) {
  const list = await fsRead('admin_products', defaultProducts)
  const idx = list.findIndex(p => p.id === updated.id)
  if (idx !== -1) list[idx] = updated
  else { updated.id = Math.max(...list.map(p => p.id || 0), 0) + 1; list.push(updated) }
  await fsWrite('admin_products', list)
}

/* ─── Orders ─── */
export async function getOrders() {
  return await fsRead('admin_orders', [])
}
export async function getOrdersByUser(userId) {
  const list = await fsRead('admin_orders', [])
  return list.filter(o => o.user_id === userId)
}
export async function addOrder(order) {
  const list = await fsRead('admin_orders', [])
  const item = { ...order, id: Math.max(...list.map(o => o.id || 0), 0) + 1, created_at: new Date().toISOString() }
  list.unshift(item)
  await fsWrite('admin_orders', list)
  return item
}
export async function updateOrderStatus(id, status) {
  const list = await fsRead('admin_orders', [])
  const idx = list.findIndex(o => o.id === id)
  if (idx === -1) return null
  list[idx].status = status
  await fsWrite('admin_orders', list)
  return list[idx]
}
export async function deleteOrder(id) {
  const list = await fsRead('admin_orders', [])
  await fsWrite('admin_orders', list.filter(o => o.id !== id))
}
export async function updateOrderTracking(id, trackingNumber) {
  const list = await fsRead('admin_orders', [])
  const idx = list.findIndex(o => o.id === id)
  if (idx === -1) return null
  list[idx].trackingNumber = trackingNumber
  await fsWrite('admin_orders', list)
  return list[idx]
}

/* ─── Blog Posts ─── */
export async function getBlogPosts() {
  const raw = await fsRead('admin_blog', defaultBlogPosts)
  const list = Array.isArray(raw) && raw.length > 0 ? raw : defaultBlogPosts
  return list.map((p, i) => ({
    ...p,
    id: p.id || i + 1,
    date: p.date || new Date().toISOString().split('T')[0],
    gradient: p.gradient || defaultBlogPosts[i % defaultBlogPosts.length].gradient,
    icon: p.icon || defaultBlogPosts[i % defaultBlogPosts.length].icon,
  }))
}
export async function addBlogPost(post) {
  const list = await fsRead('admin_blog', defaultBlogPosts)
  const nextId = Math.max(...list.map(p => p.id || 0), 0) + 1
  const item = { ...post, id: nextId, date: new Date().toISOString().split('T')[0] }
  list.push(item)
  await fsWrite('admin_blog', list)
  return item
}
export async function updateBlogPost(id, updates) {
  const list = await fsRead('admin_blog', defaultBlogPosts)
  const idx = list.findIndex(p => p.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates }
  await fsWrite('admin_blog', list)
  return list[idx]
}
export async function deleteBlogPost(id) {
  const list = await fsRead('admin_blog', defaultBlogPosts)
  await fsWrite('admin_blog', list.filter(p => p.id !== id))
}

/* ─── Coupons ─── */
export async function getCoupons() {
  return await fsRead('admin_coupons', [])
}
export async function addCoupon(coupon) {
  const list = await fsRead('admin_coupons', [])
  const item = { ...coupon, id: Math.max(...list.map(c => c.id || 0), 0) + 1 }
  list.push(item)
  await fsWrite('admin_coupons', list)
  return item
}
export async function deleteCoupon(id) {
  const list = await fsRead('admin_coupons', [])
  await fsWrite('admin_coupons', list.filter(c => c.id !== id))
}
export async function updateCoupon(code, updates) {
  const list = await fsRead('admin_coupons', [])
  const idx = list.findIndex(c => c.code === code)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates }
  await fsWrite('admin_coupons', list)
  return list[idx]
}
export async function deleteCouponByCode(code) {
  const list = await fsRead('admin_coupons', [])
  await fsWrite('admin_coupons', list.filter(c => c.code !== code))
}

/* ─── Social Links ─── */
export async function getSocialLinks() {
  const obj = await fsRead('admin_social', defaultSocial)
  return Object.entries(obj).map(([platform, url]) => ({ platform, url, is_active: !!url, id: platform }))
}
export async function upsertSocialLinks(links) {
  const obj = {}
  links.forEach(l => { obj[l.platform] = l.url })
  await fsWrite('admin_social', obj)
  return links
}

/* ─── Site Settings ─── */
export async function getSiteSettings() {
  const s = await fsRead('admin_settings', defaultSettings)
  const map = {}
  Object.entries(s).forEach(([k, v]) => { map[k] = v })
  return map
}
export async function upsertSiteSetting(key, value) {
  const settings = await fsRead('admin_settings', defaultSettings)
  settings[key] = value
  await fsWrite('admin_settings', settings)
  return { key, value }
}
export async function getSettings() {
  return await fsRead('admin_settings', defaultSettings)
}

/* ─── Colors ─── */
export async function getColors() {
  return await fsRead('admin_colors', defaultColors)
}
export function applyColors(colors) {
  const root = document.documentElement
  root.style.setProperty('--primary', colors.primary)
  root.style.setProperty('--accent', colors.accent)
  root.style.setProperty('--bg', colors.bg)
  root.style.setProperty('--text-primary', colors.text)
  root.style.setProperty('--text-muted', colors.muted)
  root.style.setProperty('--bg-card', colors.cardBg)
  root.style.setProperty('--border-color', colors.borderColor)
}

/* ─── Contact Messages ─── */
export async function getContactMessages() {
  return await fsRead('admin_contact_messages', [])
}
export async function addContactMessage(msg) {
  const list = await fsRead('admin_contact_messages', [])
  const item = { ...msg, id: Math.max(...list.map(m => m.id || 0), 0) + 1, created_at: new Date().toISOString(), is_read: false }
  list.unshift(item)
  await fsWrite('admin_contact_messages', list)
  return item
}
export async function deleteContactMessage(id) {
  const list = await fsRead('admin_contact_messages', [])
  await fsWrite('admin_contact_messages', list.filter(m => m.id !== id))
}
export async function markMessageRead(id) {
  const list = await fsRead('admin_contact_messages', [])
  const m = list.find(msg => msg.id === id)
  if (m) m.is_read = true
  await fsWrite('admin_contact_messages', list)
}

/* ─── Gift Cards ─── */
export async function getGiftCards() {
  return await fsRead('admin_gift_cards', [])
}
export async function addGiftCard(card) {
  const list = await fsRead('admin_gift_cards', [])
  const item = { ...card, id: Math.max(...list.map(c => c.id || 0), 0) + 1, created_at: new Date().toISOString() }
  list.push(item)
  await fsWrite('admin_gift_cards', list)
  return item
}
export async function updateGiftCard(id, updates) {
  const list = await fsRead('admin_gift_cards', [])
  const idx = list.findIndex(c => c.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates }
  await fsWrite('admin_gift_cards', list)
  return list[idx]
}
export async function deleteGiftCard(id) {
  const list = await fsRead('admin_gift_cards', [])
  await fsWrite('admin_gift_cards', list.filter(c => c.id !== id))
}
export async function deleteGiftCardByCode(code) {
  const list = await fsRead('admin_gift_cards', [])
  await fsWrite('admin_gift_cards', list.filter(c => c.code !== code))
}

/* ─── Newsletter ─── */
export async function getSubscribers() {
  return await fsRead('admin_subscribers', [])
}
export async function addSubscriber(email) {
  const list = await fsRead('admin_subscribers', [])
  if (list.some(s => s.email === email)) return list.find(s => s.email === email)
  const item = { email, subscribed_at: new Date().toISOString() }
  list.push(item)
  await fsWrite('admin_subscribers', list)
  return item
}

/* ─── Cart (per user — localStorage only) ─── */
function cartKey(userId) { return `cart_${userId}` }
export async function getCartItems(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(cartKey(userId))
    const items = raw ? JSON.parse(raw) : []
    const products = await getProducts()
    return items.map(item => {
      const product = products.find(p => p.id === item.product_id)
      return { ...item, products: product || null }
    })
  } catch { return [] }
}
export async function addToCart(userId, productId, quantity = 1) {
  if (!userId) return null
  const items = await getCartItems(userId)
  const existing = items.find(i => i.product_id === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    items.push({ id: Date.now(), user_id: userId, product_id: productId, quantity })
  }
  lsSet(cartKey(userId), items.map(({ products, ...rest }) => rest))
  const products = await getProducts()
  return items.find(i => i.product_id === productId) || { ...items[items.length - 1], products: products.find(p => p.id === productId) || null }
}
export async function updateCartItem(id, quantity) {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('cart_'))
  for (const key of allKeys) {
    const items = JSON.parse(localStorage.getItem(key) || '[]')
    const idx = items.findIndex(i => i.id === id)
    if (idx !== -1) {
      items[idx].quantity = quantity
      lsSet(key, items)
      const products = await getProducts()
      return { ...items[idx], products: products.find(p => p.id === items[idx].product_id) || null }
    }
  }
  return null
}
export async function removeCartItem(id) {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('cart_'))
  for (const key of allKeys) {
    const items = JSON.parse(localStorage.getItem(key) || '[]')
    const filtered = items.filter(i => i.id !== id)
    if (filtered.length !== items.length) {
      lsSet(key, filtered)
      return
    }
  }
}
export async function clearCart(userId) {
  if (!userId) return
  try { localStorage.removeItem(cartKey(userId)) } catch {}
}

/* ─── Wishlist (per user — localStorage only) ─── */
function wishlistKey(userId) { return `wishlist_${userId}` }
export async function getWishlist(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(wishlistKey(userId))
    const ids = raw ? JSON.parse(raw) : []
    const products = await getProducts()
    return ids.map(product_id => {
      const product = products.find(p => p.id === product_id)
      return { id: `w_${product_id}`, user_id: userId, product_id, products: product || null }
    })
  } catch { return [] }
}
export async function addToWishlist(userId, productId) {
  if (!userId) return null
  const list = await getWishlist(userId)
  if (list.some(i => i.product_id === productId)) return list.find(i => i.product_id === productId)
  const raw = localStorage.getItem(wishlistKey(userId))
  const ids = raw ? JSON.parse(raw) : []
  ids.push(productId)
  lsSet(wishlistKey(userId), ids)
  const products = await getProducts()
  return { id: `w_${productId}`, user_id: userId, product_id: productId, products: products.find(p => p.id === productId) || null }
}
export async function removeFromWishlist(userId, productId) {
  if (!userId) return
  const raw = localStorage.getItem(wishlistKey(userId))
  const ids = raw ? JSON.parse(raw) : []
  lsSet(wishlistKey(userId), ids.filter(id => id !== productId))
}
export async function isInWishlist(userId, productId) {
  if (!userId) return false
  const raw = localStorage.getItem(wishlistKey(userId))
  const ids = raw ? JSON.parse(raw) : []
  return ids.includes(productId)
}

/* ─── Profile (per user — localStorage only) ─── */
export async function getProfile(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(`profile_${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
export async function updateProfile(userId, updates) {
  if (!userId) return null
  const profile = await getProfile(userId) || {}
  const updated = { ...profile, ...updates }
  lsSet(`profile_${userId}`, updated)
  return updated
}

/* ─── Coupon validation ─── */
export function validateCoupon(code, subtotal) {
  const coupons = lsGet('admin_coupons', [])
  const c = coupons.find(c => c.code?.toUpperCase() === code?.toUpperCase())
  if (!c) return { valid: false, message: 'Invalid coupon code' }
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { valid: false, message: 'Coupon has expired' }
  if (c.minAmount && subtotal < c.minAmount) return { valid: false, message: `Minimum order EGP ${c.minAmount} required` }
  const discount = c.type === 'percentage' ? Math.round(subtotal * (c.value / 100)) : c.value
  return { valid: true, discount: Math.min(discount, subtotal), code: c.code, type: c.type }
}
