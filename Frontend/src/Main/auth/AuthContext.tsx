import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type AuthUser = {
	role?: string
	permissions?: string[]
}

type AuthContextValue = {
	user: AuthUser | null
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	can: (permission: string) => boolean
	refreshMe: () => Promise<void>
}

type AuthProviderProps = {
	children: ReactNode
}

type ApiErrorResponse = {
	message?: string
}

const AuthContext = createContext<AuthContextValue | null>(null)
const API_BASE = "http://localhost:5000/api"

async function api<T>(
	path: string,
	options: RequestInit & { headers?: Record<string, string> }= {}
): Promise<T | null> {
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

	const data = (await res.json().catch(() => ({}))) as T & ApiErrorResponse

	if (!res.ok) {
		throw new Error(data.message || "Request failed")
	}	

	return data
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<AuthUser | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const refreshMe = async () => {
		try {
			const me = await api<AuthUser>("/auth/me")
			setUser(me)
		} catch {
			setUser(null)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		void refreshMe()
	}, [])

	const login = async (email: string, password: string) => {
		const me = await api<AuthUser>("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		})
		setUser(me)
	}

	const logout = async () => {
		await api("/auth/logout", { method: "POST" })
		setUser(null)
	}

	const can = (permission: string) =>
		Boolean(user && (user.role === "admin" || user.permissions?.includes(permission)))

	const value: AuthContextValue = { user, isLoading, login, logout, can, refreshMe }

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = useContext(AuthContext)

	if (!ctx) {
		throw new Error("useAuth must be used inside AuthProvider")
	}

	return ctx
}