import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext()

const variants = {
  success: { bg: 'rgba(34,197,94,0.95)', icon: 'fa-check-circle' },
  error: { bg: 'rgba(239,68,68,0.95)', icon: 'fa-exclamation-circle' },
  info: { bg: 'rgba(59,130,246,0.95)', icon: 'fa-info-circle' },
  warning: { bg: 'rgba(245,158,11,0.95)', icon: 'fa-exclamation-triangle' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const v = variants[t.type] || variants.info
          return (
            <div key={t.id} style={{
              background: v.bg, color: '#fff', padding: '12px 20px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'slideInRight 0.3s ease', pointerEvents: 'auto',
              maxWidth: 360,
            }}>
              <i className={`fa ${v.icon}`} style={{ fontSize: 16 }} />
              {msg}
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
