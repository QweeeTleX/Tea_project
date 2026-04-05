import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

type CartItem = {
	id: string
	name: string
	cost: number
	pic: string[]
	categoryId: string
	subId: string
	quantity: number
}

type CartProductInput = Omit<CartItem, "quantity">

type CartContextValue = {
	items: CartItem[]
	addItem: (product: CartProductInput) => void
	removeItem: (productId: string) => void
	updateQuantity: (productId: string, nextQuantity: number) => void
	clearCart: () => void
	itemsCount: number
	totalCost: number
}

type CartProviderProps = {
	children: ReactNode
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "tea_cart_v1"

export function CartProvider({ children }: CartProviderProps) {
	const [items, setItems] = useState<CartItem[]>(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			return raw ? (JSON.parse(raw) as CartItem[]) : []
		} catch {
			return []
		}
	})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
	}, [items])

	const addItem = (product: CartProductInput) => {
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

	const removeItem = (productId: string) => {
		setItems((prev) => prev.filter((item) => item.id !== productId))
	}

	const updateQuantity = (productId: string, nextQuantity: number) => {
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

	const value: CartContextValue = {
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