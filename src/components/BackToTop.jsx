import { useState, useEffect } from 'react'

function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9997,
        width: 44, height: 44, borderRadius: '50%', border: 'none',
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        color: '#fff', fontSize: 18, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <i className="fa fa-arrow-up" />
    </button>
  )
}

export default BackToTop
