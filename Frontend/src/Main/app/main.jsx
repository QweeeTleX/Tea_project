import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "../../Styles/index.css"
import { AuthProvider } from "../auth/AuthContext.jsx"
import { CartProvider } from "../cart/CartContext.jsx"
import App from "./App.jsx"


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>  
    </AuthProvider>
  </StrictMode>
)
