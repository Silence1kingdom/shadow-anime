import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ShopDetails = lazy(() => import('./pages/ShopDetails'))
const ShoppingCart = lazy(() => import('./pages/ShoppingCart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const About = lazy(() => import('./pages/About'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetails = lazy(() => import('./pages/BlogDetails'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Payment = lazy(() => import('./pages/Payment'))
const Tracking = lazy(() => import('./pages/Tracking'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))
const AdminSiteSettings = lazy(() => import('./pages/admin/AdminSiteSettings'))
const AdminColors = lazy(() => import('./pages/admin/AdminColors'))
const AdminSocialLinks = lazy(() => import('./pages/admin/AdminSocialLinks'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminGiftCards = lazy(() => import('./pages/admin/AdminGiftCards'))
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))

function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop-details" element={<ShopDetails />} />
            <Route path="/shopping-cart" element={<ShoppingCart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-details" element={<BlogDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/tracking" element={<Tracking />} />
          </Route>
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="site-settings" element={<AdminSiteSettings />} />
          <Route path="colors" element={<AdminColors />} />
          <Route path="social" element={<AdminSocialLinks />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="gift-cards" element={<AdminGiftCards />} />
          <Route path="contact-messages" element={<AdminContactMessages />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
