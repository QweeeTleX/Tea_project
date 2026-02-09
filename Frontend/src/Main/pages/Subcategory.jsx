import "../../Styles/Subcategory.css"

import { Link, useParams } from "react-router-dom";

function Subcategory() {
	const { categoryId, subId } = useParams()

	const products = Array.from({ length: 8 }, (_, idx) => ({
		id: `p-${idx + 1}`,
		name: `Товар ${idx + 1}`,
		price: "Цена позже",
		desc: "Описание будет позже"
	}))

	return (
		<div className="app app--catalog">
			<div className="catalog">
				<div className="catalog__header">
					<Link className="catalog__back" to="/">
						Назад
					</Link>
					<div className="catalog__title">
						<span className="catalog__crumb">{categoryId}</span>
						<span className="catalog__sep">/</span>
						<span className="catalog__crumb">{subId}</span>
					</div>
				</div>

				<div className="catalog__grid">
					{products.map((product) => (
						<Link 
							key={product.id}
							className="catalog__card"
							to={`/catalog/${categoryId}/${subId}/${product.id}`}
							state={{ product }}
						>
							<div className="catalog__thumb" />
							<div className="catalog__name">Товар</div>
							<div className="catalog__price">Цена позже</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}

export default Subcategory