import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import { getBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost } from '../../utils/siteData'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--bg-glass)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  color: 'var(--text-secondary)',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  display: 'block',
}

const btnPrimary = {
  padding: '10px 22px',
  border: 'none',
  borderRadius: 6,
  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const btnDanger = {
  padding: '6px 14px',
  border: 'none',
  borderRadius: 4,
  background: 'var(--rose)',
  color: '#fff',
  fontSize: 13,
  cursor: 'pointer',
  marginLeft: 8,
}

const btnEdit = {
  padding: '6px 14px',
  border: 'none',
  borderRadius: 4,
  background: '#3b82f6',
  color: '#fff',
  fontSize: 13,
  cursor: 'pointer',
}

const inputGroup = { marginBottom: 14 }

function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    date: '',
    img: '',
    content: '',
    contentAr: '',
  })
  const { t } = useI18n()

  useEffect(() => {
    getBlogPosts().then(setPosts)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const todayStr = () => new Date().toISOString().split('T')[0]

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', titleAr: '', date: todayStr(), img: '', content: '', contentAr: '' })
    setShowForm(true)
  }

  const openEdit = (post) => {
    setEditing(post.id)
    setForm({
      title: post.title || '',
      titleAr: post.titleAr || '',
      date: post.date || '',
      img: post.img || '',
      content: post.content || '',
      contentAr: post.contentAr || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await updateBlogPost(editing, form)
    } else {
      await addBlogPost(form)
    }
    const updated = await getBlogPosts()
    setPosts(updated)
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    await deleteBlogPost(id)
    const updated = await getBlogPosts()
    setPosts(updated)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('admin.blogPosts')}</h1>
        <button style={btnPrimary} onClick={openAdd}>{t('admin.addPost')}</button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
          maxWidth: 560,
        }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 18, marginBottom: 16, margin: '0 0 16px 0' }}>
            <i className="fa fa-pencil-square-o" style={{ marginRight: 8 }} />
            {editing ? t('admin.editPost') : t('admin.addPost')}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.postTitle')}</label>
              <input style={inputStyle} name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.postTitleAr')}</label>
              <input style={inputStyle} name="titleAr" value={form.titleAr} onChange={handleChange} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.postDate')}</label>
              <input style={inputStyle} name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.image')}</label>
              <input style={inputStyle} name="img" value={form.img} onChange={handleChange} required />
              {form.img && (
                <div style={{ marginTop: 8 }}>
                  <img src={form.img} alt="preview" loading="lazy" decoding="async" style={{ width: 120, height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-glass)' }} />
                </div>
              )}
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.postContent')}</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} name="content" value={form.content} onChange={handleChange} required />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>{t('admin.postContentAr')}</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} name="contentAr" value={form.contentAr} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} type="submit">{editing ? t('admin.update') : t('admin.save')}</button>
              <button style={{ ...btnDanger, marginLeft: 0 }} type="button" onClick={() => setShowForm(false)}>{t('admin.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 10,
        overflow: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.postTitle')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.postDate')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.image')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p, i) => (
              <tr key={p.id} style={{
                color: 'var(--text-primary)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.date || '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  {p.img ? (
                    <img src={p.img} alt="" loading="lazy" decoding="async" style={{ width: 64, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                  ) : '-'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={btnEdit} onClick={() => openEdit(p)}>
                    <i className="fa fa-pencil" style={{ marginRight: 4 }} />{t('admin.edit')}
                  </button>
                  <button style={btnDanger} onClick={() => setConfirmDelete(p.id)}>
                    <i className="fa fa-trash" style={{ marginRight: 4 }} />{t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <i className="fa fa-pencil-square-o" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }} />
                  {t('admin.noBlogPosts')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 12,
            padding: 28,
            maxWidth: 400,
            width: '90%',
          }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: 18 }}>
              <i className="fa fa-exclamation-triangle" style={{ color: 'var(--rose)', marginRight: 8 }} />
              {t('admin.deletePost')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px 0' }}>
              {t('admin.deleteBlogConfirm')}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }}
                onClick={() => setConfirmDelete(null)}
              >
                {t('admin.cancel')}
              </button>
              <button
                style={{ padding: '8px 18px', border: 'none', borderRadius: 6, background: 'var(--rose)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                onClick={() => handleDelete(confirmDelete)}
              >
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBlog
