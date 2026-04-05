import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"

type RequirePermissionProps = {
	permission: string
	children: ReactNode
}

function RequirePermission({ permission, children }: RequirePermissionProps) {
	const { isLoading, can } = useAuth()
	const location = useLocation()

	if (isLoading) return null

	if (!can(permission)) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	return children
}

export default RequirePermission