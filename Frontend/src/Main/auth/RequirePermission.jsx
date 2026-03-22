import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext.jsx"

function RequirePermission({ permission, children }) {
	const { isLoading, can } = useAuth()
	const location = useLocation()

	if (isLoading) return null

	if (!can(permission)) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	return children
}

export default RequirePermission