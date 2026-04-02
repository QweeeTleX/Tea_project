import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";

function Cart() {
	const { items, itemsCount, totalCost } = useCart()

	return (
		<div className="cart-page">
			<div className="cart">
				<div className="cart__header">
					<Link className="cart__back" to="/">
						Назад
					</Link>
					<h1 className="cart__title">Корзина</h1>
				</div>

				{items.length === 0 ? (
					<div className="cart__empty">Корзина пока пуста</div>
				) : (
					<>
						<div className="cart__list">
							{items.map((item) => (
								<div key={item.id} className="cart__item">
									<div className="cart__name">{item.name}</div>
									<div className="cart__qty">Количество: {item.quantity}</div>
									<div className="cart__price">Цена: {item.cost} ₽</div>
									<div className="cart__sum">
										Сумма: {item.cost * item.quantity} ₽
									</div>
								</div>
							))}
						</div>

						<div className="cart__summary">
							<div>Товаров: {itemsCount}</div>
							<div>Итого: {totalCost} ₽</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default Cart