import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)
const API_BASE = "http://localhost:5000/api"

async function api(path, options = {}) {
	const { headers = {}, ...rest } = options

	const res = await fetch(`${API_BASE}${path}`, {
		...rest,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	})

	if (res.status === 204) return null 

	const data = await res.json().catch(() => ({}))
	if (!res.ok) throw new Error(data.message || "Request failed")
		return data
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	const refreshMe = async () => {
		try {
			const me = await api("/auth/me")
			setUser(me)
		} catch {
			setUser(null)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		refreshMe()
	}, [])

	const login = async (email, password) => {
		const me = await api("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		})
		setUser(me)
	}

	const logout = async () => {
		await api("/auth/logout", { method: "POST" })
		setUser(null)
	}

	const can = (permission) =>
		Boolean(user && (user.role === "admin" || user.permissions?.includes(permission)))

	const value = { user, isLoading, login, logout, can, refreshMe }

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
		return ctx
}