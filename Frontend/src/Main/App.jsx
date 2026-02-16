import { Routes, Route, Outlet } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Subcategory from "./pages/Subcategory.jsx"
import Product from "./pages/Product.jsx"
import Profile from "./pages/Profile.jsx"


function Layout() {
  return (
    <>
      <Profile />
      <Outlet />
    </>  
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/catalog/:categoryId/:subId" element={<Subcategory />} />
      <Route path="/catalog/:categoryId/:subId/:productId" element={<Product />} />
      </Route>
    </Routes>
  )
}

export default App