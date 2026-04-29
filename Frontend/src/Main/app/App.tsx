import { Routes, Route, Outlet, Link } from "react-router-dom"
import Home from "../pages/Home"
import Subcategory from "../pages/Subcategory"
import Product from "../pages/Product"
import Cart from "../pages/Cart"
import AppActions from "../features/AppActions"
import Admin from "../pages/Admin"
import RequirePermission from "../auth/RequirePermission"
import Login from "../pages/Login"

function Footer() {
  return (
    <footer className="site-footer">
      <Link to="#">О нас</Link>
      <Link to="#">Политика конфиденциальности</Link>
    </footer>
  )
}

function Layout() {
  return (
    <div className="site-shell">
      <AppActions />

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
      <Route
        path="/admin"
        element={
          <RequirePermission permission="admin:enter">
            <Admin />
          </RequirePermission>
        }
      />  
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/catalog/:categoryId/:subId" element={<Subcategory />} />
        <Route path="/catalog/:categoryId/:subId/:productId" element={<Product />} />
      </Route>
    </Routes>
  )
}


export default App
