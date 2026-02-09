import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Subcategory from "./pages/Subcategory.jsx"
import Product from "./pages/Product.jsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog/:categoryId/:subId" element={<Subcategory />} />
      <Route path="/catalog/:categoryId/:subId/:productId" element={<Product />} />
    </Routes>
  )
}

export default App