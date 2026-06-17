import { useState } from 'react'

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

function AdminProductEdit({ product, onClose, onSave }) {
  const [name, setName] = useState(product.name)
  const [nameAr, setNameAr] = useState(product.nameAr || '')
  const [price, setPrice] = useState(String(product.price).replace('EGP ', ''))
  const [sale, setSale] = useState(product.sale || false)
  const [image, setImage] = useState(product.image || product.img || '')
  const [preview, setPreview] = useState(product.image || product.img || '')

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result
      if (typeof dataUrl === 'string') {
        setPreview(dataUrl)
        setImage(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onSave({
      ...product,
      name,
      nameAr,
      price: Number(price),
      sale,
      img: image,
      image,
    })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 28, maxWidth: 420, width: '100%',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: 18, margin: '0 0 6px 0' }}>
          <i className="fa fa-pencil-square-o" style={{ marginRight: 8, color: 'var(--purple)' }} />
          Edit Product
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 20px 0' }}>{product.name}</p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Name (English)</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Name (Arabic)</label>
          <input style={inputStyle} value={nameAr} onChange={e => setNameAr(e.target.value)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Price (EGP)</label>
          <input style={inputStyle} value={price} onChange={e => setPrice(e.target.value)} type="number" />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
            <input type="checkbox" checked={sale} onChange={e => setSale(e.target.checked)} style={{ marginRight: 6 }} />
            Sale
          </label>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Image</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{
              padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600,
            }}>
              <i className="fa fa-upload" style={{ marginRight: 6 }} />
              Upload
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <input style={{ ...inputStyle, flex: 1 }} value={image} onChange={e => { setImage(e.target.value); setPreview(e.target.value) }} placeholder="Or paste URL..." />
          </div>
          {preview && (
            <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', width: 80, height: 80, border: '1px solid var(--border-glass)' }}>
              <img src={preview} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            padding: '8px 18px', borderRadius: 6, border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}><i className="fa fa-save" style={{ marginRight: 6 }} />Save</button>
        </div>
      </div>
    </div>
  )
}

export default AdminProductEdit
