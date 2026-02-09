import { Link, useLocation, useParams } from "react-router-dom"
import "../../Styles/Product.css"

function Product() {
	const { categoryId, subId, productId } = useParams()
	const { state } = useLocation()

	const product = 
		state?.product ?? {
			id: productId,
			name: `Товар ${productId}`,
			price: "Цена позже",
			desc: "Описание будет позже"
		}

return (
  <div className="product-page">
    <Link className="product__back" to={`/catalog/${categoryId}/${subId}`}>
      Назад
    </Link>

    <div className="product">
      <div className="product__card">
        <div className="product__thumb" />
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