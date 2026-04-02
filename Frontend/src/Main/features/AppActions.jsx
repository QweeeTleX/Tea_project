import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import Profile from "./Profile";

function CartButton() {
	const { itemsCount } = useCart()

	return (
		<Link to="/cart" className="cart-link" aria-label="Открыть корзину">
			<svg
				className="cart-link__icon"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M3 6h2l1.1 5.5h10.2l1.7-4.2H7"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx="10" cy="16.8" r="1.7" fill="currentColor" />
				<circle cx="16.8" cy="16.8" r="1.7" fill="currentColor" />
			</svg>

			{itemsCount > 0 ? (
				<span className="cart-link__badge">{itemsCount}</span>
			) : null}
		</Link>
	)
}

function AppActions() {
	return (
		<div className="app-actions">
			<CartButton />
			<Profile />
		</div>
	)
}

export default AppActions