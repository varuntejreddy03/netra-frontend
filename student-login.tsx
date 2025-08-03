"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Phone, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Animated Book Icon Component
const AnimatedBookIcon = () => {
  return (
    <motion.div
      className="w-16 h-16 mx-auto mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" stroke="white" strokeWidth="1.5">
        <motion.path
          d="M8 12 L8 52 L32 44 L56 52 L56 12 L32 20 L8 12 Z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
        />
        <motion.path
          d="M32 20 L32 44"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            delay: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 3.5,
          }}
        />
        <motion.path
          d="M16 24 L28 24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 4 }}
        />
        <motion.path
          d="M16 30 L28 30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            delay: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 4,
          }}
        />
        <motion.path
          d="M36 24 L48 24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            delay: 1.4,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 4,
          }}
        />
        <motion.path
          d="M36 30 L48 30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            delay: 1.6,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 4,
          }}
        />
      </svg>
    </motion.div>
  )
}

// Utility function to get stored auth credentials
// Now returns password for all authenticated calls
export const getStoredCredentials = () => {
  const username = localStorage.getItem("username")
  const password = localStorage.getItem("password")
  // authToken is no longer used for authentication in this setup
  // const authToken = localStorage.getItem("authToken")
  return { username, password }
}

// Utility function for authenticated API calls
// Now sends username and password in query parameters for all calls
export const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const { username, password } = getStoredCredentials()

  if (!username || !password) {
    alert("Authentication required. Please login again.") // Alert user
    localStorage.removeItem("username")
    localStorage.removeItem("password")
    // localStorage.removeItem("authToken") // No longer needed
    window.location.href = "/login"
    throw new Error("Authentication required: Missing username or password")
  }

  const baseUrl = process.env.NEXT_PUBLIC_url_backend || "https://netra-backend.vercel.app"
  // Password is now included in query parameters for all authenticated calls
  const url = `${baseUrl}${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Token header is no longer used for authentication in this setup
    // token: authToken,
    ...options.headers,
  }

  console.log("Making authenticated API call to:", url) // Debug log

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      alert("Authentication failed or session expired. Please login again.") // Alert user
      localStorage.removeItem("username")
      localStorage.removeItem("password")
      // localStorage.removeItem("authToken") // No longer needed
      window.location.href = "/login"
      throw new Error("Unauthorized or Forbidden")
    }

    const errorText = await response.text()
    console.log("API error response:", errorText.substring(0, 200))
    throw new Error(`API call failed: ${response.status}`)
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const textContent = await response.text()
    console.log("Non-JSON API response:", textContent.substring(0, 200))
    throw new Error("API returned non-JSON response")
  }
}

export default function StudentLogin() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // API call function for login (needs both username and password)
  const apiCall = async (phone: string, pass: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_url_backend || "https://netra-backend.vercel.app"
      // This URL is specifically for the initial login, where password is required
      const url = `${baseUrl}/profile?username=${encodeURIComponent(phone)}&password=${encodeURIComponent(pass)}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          console.log("Success response data:", data)
          // Token is no longer used for subsequent authentication, but we still store username/password
          return { success: true, data, token: data.token || null } // Token might still be in response, but not used
        } else {
          const textContent = await response.text()
          console.log("Non-JSON response:", textContent.substring(0, 500))
          return { success: false, error: "Server returned HTML instead of JSON", needsPassword: false }
        }
      } else if (response.status === 401 || response.status === 403) {
        try {
          const errorData = await response.json()
          console.log("Auth error response:", errorData)
          // Updated error message for invalid credentials
          return { success: false, error: "Check your Netra credentials once.", needsPassword: true }
        } catch {
          // Fallback for non-JSON error responses
          return { success: false, error: "Check your Netra credentials once.", needsPassword: true }
        }
      } else {
        try {
          const errorData = await response.json()
          console.log("Error response data:", errorData)
          return { success: false, error: errorData.error || `Server error (${response.status})`, needsPassword: false }
        } catch {
          const errorText = await response.text()
          console.log("Error response text:", errorText.substring(0, 500))
          return { success: false, error: `Server error (${response.status})`, needsPassword: false }
        }
      }
    } catch (error) {
      console.error("API call failed:", error)
      return { success: false, error: "Network error. Please check your connection.", needsPassword: false }
    }
  }

  const handleContinue = async () => {
    setError("")
    setIsLoading(true)

    try {
      const result = await apiCall(phoneNumber, password)

      if (result.success) {
        localStorage.setItem("username", phoneNumber)
        localStorage.setItem("password", password) // Store user-entered password
        // authToken is no longer used for authentication in this setup
        // if (result.token) {
        //   localStorage.setItem("authToken", result.token)
        // }
        window.location.href = "/dashboard"
      } else {
        setError("Check your Netra credentials once.") // Always set this specific message on login failure
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return phoneNumber.length >= 10 && password.length > 0
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern for a professional feel */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url("/placeholder.svg?height=100&width=100")',
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(circle at center, transparent 0%, black 70%)",
        }}
      />

      <motion.div
        className="w-full max-w-sm space-y-6 bg-gray-900 p-8 rounded-xl shadow-2xl relative z-10 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Book Icon */}
        <AnimatedBookIcon />

        {/* Header */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Netra Student Login</h1>
          <p className="text-gray-400 text-sm">Enter your credentials to access your student dashboard.</p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white text-sm font-medium">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 "
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input - Always visible */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-md border border-red-500/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                ❌ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <Button
            onClick={handleContinue}
            disabled={!isFormValid() || isLoading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 font-semibold py-2.5 rounded-lg transition-all duration-200"
          >
            {isLoading ? (
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </motion.div>
            ) : (
              "Login"
            )}
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="text-gray-500 text-xs">
            Trouble logging in?{" "}
            <a
              href="https://kmce.teleuniv.in/netra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300 transition-colors"
            >
              use Netra credentials only
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
