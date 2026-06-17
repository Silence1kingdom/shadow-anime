function ProductSkeleton({ count = 4 }) {
  const skeleton = { background: 'var(--bg-glass)', borderRadius: 8, animation: 'shimmer 1.5s infinite' }
  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { opacity: 0.6 } 50% { opacity: 1 } 100% { opacity: 0.6 } }
      `}</style>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="col-lg-3 col-md-6 col-sm-6">
          <div style={{ padding: 16 }}>
            <div style={{ ...skeleton, width: '100%', height: 220, marginBottom: 12 }} />
            <div style={{ ...skeleton, width: '60%', height: 14, marginBottom: 8 }} />
            <div style={{ ...skeleton, width: '40%', height: 14, marginBottom: 8 }} />
            <div style={{ ...skeleton, width: '30%', height: 18 }} />
          </div>
        </div>
      ))}
    </>
  )
}

export default ProductSkeleton
