import { useState } from "react"
import { supabase } from "../supabase"
import { useNavigate } from "react-router-dom"
import "./login.css"
import logo  from "./assets/logo.png"
import { LockKeyIcon, UserIcon } from "@phosphor-icons/react"

export default function Login() {
   // Form field state — tracks what the user types in real time
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

   // UI feedback state — controls error message and button loading text
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Used to redirect the user after a successful login
  const navigate = useNavigate()

  // Handles login form submission
  const handleLogin = async () => {
    setLoading(true)
    setError("")// Clear any previous error before retrying

    // Attempt sign-in via Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Show a generic message to avoid leaking whether email or password was wrong
      setError("Invalid email or password")
    } else {
      navigate("/dashboard") // On success, send the user to the main dashboard
    }
    setLoading(false)
}

return (
    <div className="login-container">
      <div className="login-card">

      {/* App branding */}
        <img
          src={logo}
          alt="Logo"
          className="login-logo"
        />

        <h1 className="login-title">Welcome back!</h1>

        {/* Conditionally rendered error banner */}
        {error && <p className="login-error">{error}</p>}

        {/* Email input with icon overlay */}
        <div className="login-input-wrapper">
          <input
            type="email"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <span className="login-icon">
            <UserIcon size={20} weight="fill" color="#3d3e71" />
          </span>
        </div>

        {/* Password input with icon overlay */}
        <div className="login-input-wrapper">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <span className="login-icon">
            <LockKeyIcon size={20} weight="fill" color="#3d3e71" />
          </span>
        </div>

        {/* Submit button — disabled while request is in flight */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? "Logging in..." : "login"}
        </button>

      </div>
    </div>
  )
}