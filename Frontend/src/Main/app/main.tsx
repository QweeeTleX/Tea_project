import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "../../Styles/index.css"
import { AuthProvider } from "../auth/AuthContext"
import { CartProvider } from "../cart/CartContext"
import App from "./App"


createRoot(document.getElementById("root")!).render(
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
