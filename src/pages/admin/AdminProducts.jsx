import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../utils/siteData'

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

const labelStyle = { color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }

const btnPrimary = {
  padding: '10px 22px', border: 'none', borderRadius: 6,
  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
}

const btnDanger = { padding: '6px 14px', border: 'none', borderRadius: 4, background: 'var(--rose)', color: '#fff', fontSize: 13, cursor: 'pointer', marginLeft: 8 }

const btnEdit = { padding: '6px 14px', border: 'none', borderRadius: 4, background: '#3b82f6', color: '#fff', fontSize: 13, cursor: 'pointer' }

const inputGroup = { marginBottom: 14 }

const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [page, setPage] = useState(1)
  const perPage = 8
  const [form, setForm] = useState({
    name: '', nameAr: '', price: '', category: 'T-Shirts',
    image: '', gallery: '', description: '', sale: false, stock: '',
    sizes: ['S', 'M', 'L', 'XL'],
  })
  const { t } = useI18n()

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  useEffect(() => {
    const filtered = products.filter(p => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return p.name.toLowerCase().includes(term) ||
        (p.nameAr || '').toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    })
    const totalPages = Math.ceil(filtered.length / perPage)
    const safePage = Math.min(page, Math.max(totalPages, 1))
    if (safePage !== page) setPage(safePage)
  }, [page, products, categoryFilter, searchTerm])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleSize = (s) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
    }))
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', nameAr: '', price: '', category: 'T-Shirts', image: '', gallery: '', description: '', sale: false, stock: '', sizes: ['S', 'M', 'L', 'XL'] })
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditing(product.id)
    setForm({
      name: product.name,
      nameAr: product.nameAr || '',
      price: product.price,
      category: product.category,
      image: product.image || product.img || '',
      gallery: Array.isArray(product.gallery) ? product.gallery.join('\n') : (product.gallery || ''),
      description: product.description || '',
      sale: product.sale || false,
      stock: product.stock ?? '',
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const product = {
      ...form,
      price: Number(form.price),
      gallery: form.gallery ? form.gallery.split('\n').map(s => s.trim()).filter(Boolean) : [],
    }
    if (editing) {
      await updateProduct(editing, product)
    } else {
      await addProduct(product)
    }
    const updated = await getProducts()
    setProducts(updated)
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    const updated = await getProducts()
    setProducts(updated)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('admin.products')}</h1>
          <input type="text" placeholder={t('admin.searchPlaceholder')} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 200 }} />
        </div>
        <button style={btnPrimary} onClick={openAdd}>{t('admin.addProduct')}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', 'T-Shirts', 'Hoodies', 'Accessories'].map(cat => (
          <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1) }} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: categoryFilter === cat ? 'var(--purple)' : 'rgba(255,255,255,0.04)',
            color: categoryFilter === cat ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}>
            {cat === 'All' ? t('admin.productAll', 'All') : t('admin.category' + cat, cat)}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 24, marginBottom: 24, maxWidth: 600 }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 18, margin: '0 0 16px 0' }}>
            <i className="fa fa-pencil-square-o" style={{ marginRight: 8 }} />{editing ? t('admin.editProduct') : t('admin.addProduct')}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.nameEn')}</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.nameAr')}</label>
              <input style={inputStyle} name="nameAr" value={form.nameAr} onChange={handleChange} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.price')}</label>
              <input style={inputStyle} name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.category')}</label>
              <select style={inputStyle} name="category" value={form.category} onChange={handleChange}>
                <option value="T-Shirts">{t('admin.categoryTshirts', 'T-Shirts')}</option>
                <option value="Hoodies">{t('admin.categoryHoodies', 'Hoodies')}</option>
                <option value="Accessories">{t('admin.categoryAccessories', 'Accessories')}</option>
              </select>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.mainImageUrl', 'Main Image URL')}</label>
              <input style={inputStyle} name="image" value={form.image} onChange={handleChange} required />
              {form.image && <img src={form.image} alt="" loading="lazy" decoding="async" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-glass)', marginTop: 8 }} />}
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.galleryImages', 'Gallery Images (one URL per line)')}</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} name="gallery" value={form.gallery} onChange={handleChange} placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg" />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.availableSizes', 'Available Sizes')}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {allSizes.map(s => (
                  <label key={s} style={{
                    padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, userSelect: 'none',
                    background: form.sizes.includes(s) ? 'var(--purple)' : 'rgba(255,255,255,0.04)',
                    border: form.sizes.includes(s) ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                    color: form.sizes.includes(s) ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}>
                    <input type="checkbox" checked={form.sizes.includes(s)} onChange={() => toggleSize(s)} style={{ display: 'none' }} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.description')}</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.stock')}</label>
              <input style={inputStyle} name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
            </div>
            <div style={inputGroup}>
              <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="sale" checked={form.sale} onChange={handleChange} />{t('admin.sale')}
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} type="submit">{editing ? t('admin.update') : t('admin.save')}</button>
              <button style={{ ...btnDanger, marginLeft: 0 }} type="button" onClick={() => setShowForm(false)}>{t('admin.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.nameEn')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.nameAr')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.price')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.stock')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.sizes')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.sale')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.image')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = products.filter(p => {
                if (categoryFilter !== 'All' && p.category !== categoryFilter) return false
                if (!searchTerm) return true
                const term = searchTerm.toLowerCase()
                return p.name.toLowerCase().includes(term) ||
                  (p.nameAr || '').toLowerCase().includes(term) ||
                  p.category.toLowerCase().includes(term)
              })
              const totalPages = Math.ceil(filtered.length / perPage)
              const safePage = Math.min(page, Math.max(totalPages, 1))
              const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage)
              return paginated.map((p, i) => (
                <tr key={p.id} style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>{p.nameAr || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>EGP {p.price}</td>
                  <td style={{ padding: '12px 16px' }}>{p.stock !== undefined && p.stock !== '' ? (
                    <span style={{ color: Number(p.stock) < 5 ? 'var(--rose)' : '#22c55e', fontWeight: 600 }}>{p.stock}</span>
                  ) : '-'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>{Array.isArray(p.sizes) ? p.sizes.join(', ') : '-'}</td>
                  <td style={{ padding: '12px 16px' }}>{p.sale ? <span style={{ color: '#22c55e' }}>{t('admin.yes', 'Yes')}</span> : '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {(p.image || p.img) ? <img src={p.image || p.img} alt="" loading="lazy" decoding="async" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} /> : '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={btnEdit} onClick={() => openEdit(p)}><i className="fa fa-pencil" style={{ marginRight: 4 }} />{t('admin.edit')}</button>
                    <button style={btnDanger} onClick={() => setConfirmDelete(p.id)}><i className="fa fa-trash" style={{ marginRight: 4 }} />{t('admin.delete')}</button>
                  </td>
                </tr>
              ))
            })()}
            {products.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}><i className="fa fa-cube" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }} />{t('admin.noProducts')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(() => {
        const totalPages = Math.ceil(products.filter(p => {
          if (categoryFilter !== 'All' && p.category !== categoryFilter) return false
          if (!searchTerm) return true
          const term = searchTerm.toLowerCase()
          return p.name.toLowerCase().includes(term) || (p.nameAr || '').toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
        }).length / perPage)
        if (totalPages <= 1) return null
        return (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{
              padding: '6px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'var(--bg-glass)', color: page <= 1 ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: page <= 1 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600,
            }}>{t('admin.prevPage', '<')}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                padding: '6px 14px', border: 'none', borderRadius: 6, background: page === p ? 'var(--purple)' : 'var(--bg-glass)', color: page === p ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{
              padding: '6px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'var(--bg-glass)', color: page >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: 13, fontWeight: 600,
            }}>{t('admin.nextPage', '>')}</button>
          </div>
        )
      })()}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 12, padding: 28, maxWidth: 400, width: '90%' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: 18 }}>
              <i className="fa fa-exclamation-triangle" style={{ color: 'var(--rose)', marginRight: 8 }} />{t('admin.deleteProduct')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px 0' }}>{t('admin.deleteConfirmProduct')}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }} onClick={() => setConfirmDelete(null)}>{t('admin.cancel')}</button>
              <button style={{ padding: '8px 18px', border: 'none', borderRadius: 6, background: 'var(--rose)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }} onClick={() => handleDelete(confirmDelete)}>{t('admin.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
