import { createContext, useContext, useEffect, useMemo, useState } from "react"

const CartContext = createContext(null)
const STORAGE_KEY = "tea_cart_v1"

export function CartProvider({ children }) {
	const [items, setItems] = useState(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			return raw ? JSON.parse(raw) : []
		} catch {
			return []
		}
	})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
	}, [items])

	const addItem = (product) => {
		setItems((prev) => {
			const existing = prev.find((item) => item.id === product.id)

			if (existing) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			}

			return [
				...prev,
				{
					id: product.id,
					name: product.name,
					cost: product.cost ?? 0,
					pic: product.pic || [],
					categoryId: product.categoryId,
					subId: product.subId,
					quantity: 1,
				},
			]
		})
	}

	const removeItem = (productId) => {
		setItems((prev) => prev.filter((item) => item.id !== productId))
	}

	const updateQuantity = (productId, nextQuantity) => {
		if (nextQuantity <= 0) {
			removeItem(productId)
			return
		}

		setItems((prev) =>
			prev.map((item) =>
				item.id === productId
					? { ...item, quantity: nextQuantity }
					: item
			)
		)
	}

	const clearCart = () => {
		setItems([])
	}

	const itemsCount = useMemo(
		() => items.reduce((sum, item) => sum + item.quantity, 0),
		[items]
	)

	const totalCost = useMemo(
		() => items.reduce((sum, item) => sum + item.cost * item.quantity, 0),
		[items]
	)

	const value = {
		items,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
		itemsCount,
		totalCost,
	}

	return (
		<CartContext.Provider value={value}>
			{children}
		</CartContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
	const ctx = useContext(CartContext)

	if (!ctx) {
		throw new Error("useCart must be used inside CartProvider")
	}

	return ctx
}