import { supabase } from './config'

/* ─── Products ─── */
export async function getProducts() {
  const { data } = await supabase.from('products').select('*').order('id', { ascending: false })
  return data || []
}
export async function addProduct(product) {
  const { data } = await supabase.from('products').insert(product).select().single()
  return data
}
export async function updateProduct(id, updates) {
  const { data } = await supabase.from('products').update(updates).eq('id', id).select().single()
  return data
}
export async function deleteProduct(id) {
  await supabase.from('products').delete().eq('id', id)
}

/* ─── Orders ─── */
export async function getOrders() {
  const { data } = await supabase.from('orders').select('*').order('id', { ascending: false })
  return data || []
}
export async function getOrdersByUser(userId) {
  const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('id', { ascending: false })
  return data || []
}
export async function addOrder(order) {
  const { data } = await supabase.from('orders').insert(order).select().single()
  return data
}
export async function updateOrderStatus(id, status) {
  const { data } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
  return data
}

/* ─── Blog Posts ─── */
export async function getBlogPosts() {
  const { data } = await supabase.from('blog_posts').select('*').order('id', { ascending: false })
  return data || []
}
export async function addBlogPost(post) {
  const { data } = await supabase.from('blog_posts').insert(post).select().single()
  return data
}
export async function updateBlogPost(id, updates) {
  const { data } = await supabase.from('blog_posts').update(updates).eq('id', id).select().single()
  return data
}
export async function deleteBlogPost(id) {
  await supabase.from('blog_posts').delete().eq('id', id)
}

/* ─── Coupons ─── */
export async function getCoupons() {
  const { data } = await supabase.from('coupons').select('*').order('id', { ascending: false })
  return data || []
}
export async function addCoupon(coupon) {
  const { data } = await supabase.from('coupons').insert(coupon).select().single()
  return data
}
export async function deleteCoupon(id) {
  await supabase.from('coupons').delete().eq('id', id)
}

/* ─── Social Links ─── */
export async function getSocialLinks() {
  const { data } = await supabase.from('social_links').select('*')
  return data || []
}
export async function upsertSocialLinks(links) {
  await supabase.from('social_links').delete().neq('id', 0)
  if (links.length > 0) await supabase.from('social_links').insert(links)
  return await getSocialLinks()
}

/* ─── Site Settings ─── */
export async function getSiteSettings() {
  const { data } = await supabase.from('site_settings').select('*')
  const obj = {}
  ;(data || []).forEach(r => { obj[r.key] = r.value })
  return obj
}
export async function upsertSiteSetting(key, value) {
  const { data } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' }).select().single()
  return data
}

/* ─── Contact Messages ─── */
export async function getContactMessages() {
  const { data } = await supabase.from('contact_messages').select('*').order('id', { ascending: false })
  return data || []
}
export async function addContactMessage(msg) {
  const { data } = await supabase.from('contact_messages').insert(msg).select().single()
  return data
}
export async function markMessageRead(id) {
  await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
}
export async function deleteContactMessage(id) {
  await supabase.from('contact_messages').delete().eq('id', id)
}

/* ─── Gift Cards ─── */
export async function getGiftCards() {
  const { data } = await supabase.from('gift_cards').select('*').order('id', { ascending: false })
  return data || []
}
export async function addGiftCard(card) {
  const { data } = await supabase.from('gift_cards').insert(card).select().single()
  return data
}
export async function updateGiftCard(id, updates) {
  const { data } = await supabase.from('gift_cards').update(updates).eq('id', id).select().single()
  return data
}
export async function deleteGiftCard(id) {
  await supabase.from('gift_cards').delete().eq('id', id)
}

/* ─── Newsletter ─── */
export async function getSubscribers() {
  const { data } = await supabase.from('newsletter_subscribers').select('*')
  return data || []
}
export async function addSubscriber(email) {
  const { data } = await supabase.from('newsletter_subscribers').insert({ email }).select().single()
  return data
}

/* ─── Cart ─── */
export async function getCartItems(userId) {
  const { data } = await supabase.from('cart_items').select('*, products(*)').eq('user_id', userId)
  return data || []
}
export async function addToCart(userId, productId, quantity = 1) {
  const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  if (existing) {
    const { data } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id).select('*, products(*)').single()
    return data
  }
  const { data } = await supabase.from('cart_items').insert({ user_id: userId, product_id: productId, quantity }).select('*, products(*)').single()
  return data
}
export async function updateCartItem(id, quantity) {
  const { data } = await supabase.from('cart_items').update({ quantity }).eq('id', id).select('*, products(*)').single()
  return data
}
export async function removeCartItem(id) {
  await supabase.from('cart_items').delete().eq('id', id)
}
export async function clearCart(userId) {
  await supabase.from('cart_items').delete().eq('user_id', userId)
}

/* ─── Wishlist ─── */
export async function getWishlist(userId) {
  const { data } = await supabase.from('wishlist_items').select('*, products(*)').eq('user_id', userId)
  return data || []
}
export async function addToWishlist(userId, productId) {
  const { data: existing } = await supabase.from('wishlist_items').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  if (existing) return existing
  const { data } = await supabase.from('wishlist_items').insert({ user_id: userId, product_id: productId }).select('*, products(*)').single()
  return data
}
export async function removeFromWishlist(userId, productId) {
  await supabase.from('wishlist_items').delete().eq('user_id', userId).eq('product_id', productId)
}
export async function isInWishlist(userId, productId) {
  const { data } = await supabase.from('wishlist_items').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  return !!data
}

/* ─── Profile ─── */
export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}
export async function updateProfile(userId, updates) {
  const { data } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  return data
}
export async function setAdminByEmail(email) {
  await supabase.from('profiles').update({ is_admin: true }).eq('email', email)
}
