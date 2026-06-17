import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import LiveChat from './LiveChat'
import BackToTop from './BackToTop'
import { ToastProvider } from './Toast'

function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return (
    <ToastProvider>
      <Header />
      <Outlet />
      <Footer />
      <LiveChat />
      <BackToTop />
    </ToastProvider>
  )
}

export default Layout
