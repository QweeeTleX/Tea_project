import { useState } from "react"
import type { FormEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import "../../Styles/Login.css"

type LoginLocationState = {
	from?: {
		pathname?: string
	}
}


function Login() {
	const { login } = useAuth()
	const navigate = useNavigate()
	const location = useLocation() as { state: LoginLocationState | null }

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const from = location.state?.from?.pathname || "/"

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError("")
		setIsSubmitting(true)

		try {
			await login(email, password)
			navigate(from, { replace: true })
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed")
		} finally {
			setIsSubmitting(false)
		}
	}
{/*!!!!*/}
	return (
		<div className="login-page">
			<form className="login-form" onSubmit={onSubmit}>
				<h1 className="login-title">Login</h1>

				<label className="login-field">
					<span>Email</span>
					<input
						className="login-input"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>	
				</label>

				<label className="login-field">
          <span>Password</span>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

				{error ? <div className="login-error">{error}</div> : null}

				<button className="login-submit" type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</div>
	)
}
export default Login