import "../../Styles/Subcategory.css"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

const API_BASE = "http://localhost:5000/api"
const FILES_BASE = "http://localhost:5000"

function resolveImageSrc(src) {
  if (!src) return ""
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith("/")) return `${FILES_BASE}${src}`
  return `${FILES_BASE}/${src}`
}

function Subcategory() {
  const { categoryId, subId } = useParams()

  const [products, setProducts] = useState([])
  const [categoryTitle, setCategoryTitle] = useState("")
  const [subcategoryTitle, setSubcategoryTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError("")

      try {
        const res = await fetch(`${API_BASE}/catalog/${categoryId}/${subId}`)
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.message || "Не удалось загрузить товары")
        }

        if (cancelled) return

        setProducts(data.products || [])
        setCategoryTitle(data.category || categoryId)
        setSubcategoryTitle(data.subcategory || subId)
      } catch (err) {
        if (cancelled) return

        setProducts([])
        setCategoryTitle(categoryId)
        setSubcategoryTitle(subId)
        setError(err.message || "Не удалось загрузить товары")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [categoryId, subId])

  return (
    <div className="app app--catalog">
      <div className="catalog">
        <div className="catalog__header">
          <Link className="catalog__back" to="/">
            Назад
          </Link>

          <div className="catalog__title">
            <span className="catalog__crumb">{categoryTitle || categoryId}</span>
            <span className="catalog__sep">/</span>
            <span className="catalog__crumb">{subcategoryTitle || subId}</span>
          </div>
        </div>

        <div className="catalog__grid">
          {isLoading ? <div className="catalog__status">Загрузка...</div> : null}

          {!isLoading && error ? <div className="catalog__status">{error}</div> : null}

          {!isLoading && !error && products.length === 0 ? (
            <div className="catalog__status">В этой подкатегории пока нет товаров</div>
          ) : null}

          {!isLoading && !error
            ? products.map((product) => {
                const cardProduct = {
                  ...product,
                  pic: (product.pic || []).map(resolveImageSrc),
                  price: product.cost != null ? `${product.cost} ₽` : "Цена позже",
                }

                return (
                  <Link
                    key={product.id}
                    className="catalog__card"
                    to={`/catalog/${categoryId}/${subId}/${product.id}`}
                    state={{ product: cardProduct }}
                  >
                    <div className="catalog__thumb">
                      {product.pic?.[0] ? (
                        <img
                          className="catalog__img"
                          src={resolveImageSrc(product.pic[0])}
                          alt={product.name}
                        />
                      ) : null}
                    </div>

                    <div className="catalog__name">{product.name}</div>
                    <div className="catalog__price">
                      {product.cost != null ? `${product.cost} ₽` : "Цена позже"}
                    </div>
                  </Link>
                )
              })
            : null}
        </div>
      </div>
    </div>
  )
}

export default Subcategory
