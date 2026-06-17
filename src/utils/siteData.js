// src/utils/siteData.js — now backed by Supabase

import {
  getProducts as supabaseGetProducts,
  getBlogPosts as supabaseGetBlogPosts,
  getSocialLinks as supabaseGetSocialLinks,
  getSiteSettings,
  getCoupons as supabaseGetCoupons,
  updateProduct,
} from '../supabase/data'

const defaultSettings = {
  siteName: 'SHADOW ANIME',
  currency: 'EGP',
  shipping: '50',
  freeShippingThreshold: '1000',
  tagline: 'Premium anime-inspired fashion',
  description: 'The customer is at the heart of our unique business model.',
  address: 'Cairo, Egypt',
  phone: '+20 104 262 614',
  email: 'vectorblack03@gmail.com',
  whatsapp: '+20104262614',
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

export async function getProducts() {
  const data = await supabaseGetProducts()
  return data.map((p, i) => ({
    id: p.id || i + 1,
    img: p.image || p.img || '',
    image: p.image || p.img || '',
    name: p.name || 'Product',
    nameAr: p.nameAr || p.name || '',
    price: String(p.price || 0),
    sale: p.sale || false,
    category: p.category || 'T-Shirts',
    description: p.description || '',
    sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : undefined,
    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : undefined,
  }))
}

export async function saveProduct(updated) {
  return updateProduct(updated.id, updated)
}

export async function getBlogPosts() {
  const data = await supabaseGetBlogPosts()
  return data.map((p, i) => ({
    id: p.id || i + 1,
    title: p.title || 'Blog Post',
    date: p.date || '2026',
    img: p.img || '',
    gradient: p.gradient || 'linear-gradient(135deg, #1a0533 0%, #8b5cf6 100%)',
    icon: p.icon || 'fa-tags',
    excerpt: p.excerpt || (p.content ? p.content.slice(0, 120) : ''),
    content: p.content || '',
  }))
}

export async function getSettings() {
  const data = await getSiteSettings()
  return { ...defaultSettings, ...data }
}

export async function getColors() {
  const data = await getSiteSettings()
  const merged = { ...defaultColors }
  if (data.admin_colors) {
    try {
      const parsed = typeof data.admin_colors === 'string' ? JSON.parse(data.admin_colors) : data.admin_colors
      Object.assign(merged, parsed)
    } catch {}
  }
  return merged
}

export async function getSocialLinks() {
  const data = await supabaseGetSocialLinks()
  const obj = {}
  data.forEach(item => { obj[item.name] = item.url })
  return obj
}

export async function getCoupons() {
  return supabaseGetCoupons()
}

export async function validateCoupon(code) {
  const coupons = await supabaseGetCoupons()
  const c = coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
  if (!c) return { valid: false, message: 'Invalid coupon code' }
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { valid: false, message: 'Coupon has expired' }
  return { valid: true, coupon: c }
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
