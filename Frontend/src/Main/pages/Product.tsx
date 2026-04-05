import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useCart } from "../cart/CartContext"
import type { ProductData } from "../types/product"
import "../../Styles/Product.css"

const API_BASE = "http://localhost:5000/api"
const FILES_BASE = "http://localhost:5000"

function resolveImageSrc(src: string) {
  if (!src) return ""
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith("/")) return `${FILES_BASE}${src}`
  return `${FILES_BASE}/${src}`
}

type ProductLocationState = {
  product?: ProductData
}

type ProductApiResponse = {
  id: string
  name: string
  cost?: number
  pic?: string[]
  desc?: string
  message?: string
}

function Product() {
  const { categoryId = "", subId = "", productId = "" } = useParams()
  const { state } = useLocation() as { state: ProductLocationState | null }
  const { addItem } = useCart()

  const [product, setProduct] = useState<ProductData | null>(state?.product ?? null)
  const [isLoading, setIsLoading] = useState(!state?.product)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setError("")
      setIsLoading(true)

      try {
        const res = await fetch(`${API_BASE}/product/${productId}`)
        const data = await res.json().catch(() => ({})) as ProductApiResponse

        if (!res.ok) {
          throw new Error(data.message || "Не удалось загрузить товар")
        }

        if (cancelled) return

        setProduct({
          ...data,
          pic: data.pic || [],
          price: data.cost != null ? `${data.cost} ₽` : "Цена позже",
          desc: data.desc || "Описание пока отсутствует",
        })
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Не удалось загрузить товар")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id,
      name: product.name,
      cost: product.cost ?? 0,
      pic: product.pic || [],
      categoryId,
      subId,
    })
  }

  return (
    <div className="product-page">
      <Link className="product__back" to={`/catalog/${categoryId}/${subId}`}>
        Назад
      </Link>

      {isLoading ? <div className="product__descbox">Загрузка...</div> : null}

      {!isLoading && error ? <div className="product__descbox">{error}</div> : null}

      {!isLoading && !error && product ? (
        <div className="product">
          <div className="product__card">
            <div className="product__thumb">
              {product.pic?.[0] ? (
                <img
                  className="product__img"
                  src={resolveImageSrc(product.pic[0])}
                  alt={product.name}
                />
              ) : null}
            </div>
            <div className="product__caption">
              <div className="product__name">{product.name}</div>
              <div className="product__meta">Карточка товара</div>
            </div>
          </div>

          <div className="product__right">
            <div className="product__info">
              <div className="product__title">{product.name}</div>
              <div className="product__price">{product.price}</div>

              <button
                type="button"
                className="product__cart-btn"
                onClick={handleAddToCart}
              >
                Добавить в корзину
              </button>

            </div>

            <div className="product__descbox">{product.desc}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Product
