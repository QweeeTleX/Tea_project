import { Link, useLocation, useParams } from "react-router-dom"
import "../../Styles/Product.css"

const FILES_BASE = "http://localhost:5000"

function resolveImageSrc(src) {
  if (!src) return ""
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith("/")) return `${FILES_BASE}${src}`
  return `${FILES_BASE}/${src}`
}

function Product() {
  const { categoryId, subId, productId } = useParams()
  const { state } = useLocation()

  const product =
    state?.product ?? {
      id: productId,
      name: `Товар ${productId}`,
      price: "Цена позже",
      desc: "Описание будет позже",
      pic: [],
    }

  return (
    <div className="product-page">
      <Link className="product__back" to={`/catalog/${categoryId}/${subId}`}>
        Назад
      </Link>

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
          <div className="product__name">{product.name}</div>
        </div>

        <div className="product__right">
          <div className="product__info">
            <div className="product__title">{product.name}</div>
            <div className="product__price">{product.price}</div>
          </div>

          <div className="product__descbox">{product.desc}</div>
        </div>
      </div>
    </div>
  )
}

export default Product
