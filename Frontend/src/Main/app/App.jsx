import { Routes, Route, Outlet } from "react-router-dom"
import Home from "../pages/Home.jsx"
import Subcategory from "../pages/Subcategory.jsx"
import Product from "../pages/Product.jsx"
import Cart from "../pages/Cart.jsx"
import AppActions from "../features/AppActions.jsx"
import Admin from "../pages/Admin.jsx"
import RequirePermission from "../auth/RequirePermission.jsx"
import Login from "../pages/Login.jsx"



function Layout() {
  return (
    <>
      <AppActions />
      <Outlet />
    </>
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
