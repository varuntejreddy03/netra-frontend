"use client"

import { useState, useEffect } from "react" // Import useEffect
import { motion } from "framer-motion"
import { User, LogIn, LogOut, Calendar, BookOpen, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStoredCredentials } from "./student-login"
import ProfileModal from "./profile-modal"
// Removed import { StudentProfile } from "./profile-modal"
import { ThemeToggle } from "./components/theme-toggle" // Import ThemeToggle


/**
 * Interface for the student profile data.
 * Contains various fields related to the student's information.
 */
interface StudentProfile {
  student?: {
    name?: string
  }
  name?: string
  htno: string
  course: string | { id: string; code: string; name?: string }
  branch: string | { id: string; code: string; name?: string }
  year: string | number
  section: string | { id: string; code: string; name?: string }
  hallTicketNo?: string
  rollNo?: string
  studentId?: string
}

/**
 * Interface for the DashboardHeader component props.
 * Receives the student profile data.
 */
interface DashboardHeaderProps {
  profile: StudentProfile | null
}

// Helper function to extract display value from object or string
const getDisplayValue = (value: any): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  if (typeof value === "object") {
    return value.name || value.code || value.title || value.id || ""
  }
  return String(value)
}

/**
 * DashboardHeader component.
 * Displays the header section of the dashboard with the app title,
 * action buttons for login/logout, and a welcome message for logged-in users.
 */
export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // State to track login status
  const [username, setUsername] = useState<string | null>(null) // State for username for ProfileModal

  useEffect(() => {
    // Check login status only on the client side
    const { username: storedUsername, password: storedPassword } = getStoredCredentials()
    setIsLoggedIn(!!storedUsername && !!storedPassword)
    setUsername(storedUsername) // Set username for ProfileModal
  }, []) // Run once on client mount

  const handleLogin = () => {
    window.location.href = "/login"
  }

  const handleLogout = () => {
    localStorage.removeItem("username")
    localStorage.removeItem("password")
    console.log("Local storage cleared. Redirecting to /.")
    window.location.href = "/" // Changed from "/login" to "/"
  }

  const getDisplayName = () => {
    if (profile?.student?.name) {
      return getDisplayValue(profile.student.name).toUpperCase()
    }
    if (profile?.name) {
      return getDisplayValue(profile.name).toUpperCase()
    }
    return username ? username.toUpperCase() : "STUDENT" // Use state username
  }

  return (
    <>
      <motion.header
        className="bg-black border-b border-gray-800 px-4 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Top Row - Title and Buttons */}
          {/* Changed to flex-row to keep title and buttons on the same line */}
          <div className="flex items-center justify-between mb-4">
            {/* Left - App Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                <span className="text-black font-bold text-lg">📅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NetraPro</h1>
                <p className="text-gray-400 text-sm">created by Varun</p>
              </div>
            </div>

            {/* Right - Action Buttons */}
            {/* Adjusted spacing for smaller screens */}
            <div className="flex items-center gap-2">
              {/* Profile Button */}
              <Button
                variant="outline"
                onClick={() => setIsProfileModalOpen(true)}
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent px-3 py-2 text-sm h-auto" // Smaller padding/height for mobile
                disabled={!isLoggedIn} // Use state isLoggedIn
              >
                <User className="h-4 w-4 mr-1 sm:mr-2" /> {/* Smaller margin on mobile */}
                <span className="hidden sm:inline">Profile</span> {/* Hide text on very small screens */}
              </Button>

              {/* Login/Logout Buttons */}
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent px-3 py-2 text-sm h-auto" // Smaller padding/height for mobile
                >
                  <LogOut className="h-4 w-4 mr-1 sm:mr-2" /> {/* Smaller margin on mobile */}
                  <span className="hidden sm:inline">Logout</span> {/* Hide text on very small screens */}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent px-3 py-2 text-sm h-auto" // Smaller padding/height for mobile
                >
                  <LogIn className="h-4 w-4 mr-1 sm:mr-2" /> {/* Smaller margin on mobile */}
                  <span className="hidden sm:inline">Login</span> {/* Hide text on very small screens */}
                </Button>
              )}
              {/* Theme Toggle Button */}
              <ThemeToggle />
            </div>
          </div>

          {/* Bottom Row - Welcome Message */}
          {isLoggedIn && (
            <motion.div
              className="flex items-center gap-3 text-white mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center justify-center w-6 h-6 bg-gray-700 rounded">
                <span className="text-xs">📋</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Welcome, {getDisplayName()} KMCE!</h2>
                <p className="text-gray-400 text-sm">Track your attendance and stay on top of your goals.</p>
              </div>
            </motion.div>
          )}

          {/* Quick Action Buttons - Now inside Header, responsive for mobile */}
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              className="w-full bg-white text-black hover:bg-gray-200 font-medium py-4 rounded-xl"
              onClick={() => (window.location.href = "/timetable")}
            >
              <Calendar className="h-5 w-5 mr-2" />
              View Timetable
            </Button>

            <Button
              className="w-full bg-gray-800 text-white hover:bg-gray-700 font-medium py-4 rounded-xl border border-gray-700"
              onClick={() => (window.location.href = "/attendance")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Subject-wise Attendance
            </Button>

            <Button
              className="w-full bg-gray-700 text-white hover:bg-gray-600 font-medium py-4 rounded-xl border border-gray-600"
              onClick={() => (window.location.href = "/attendance-summary")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Attendance Summary
            </Button>
          </motion.div>
        </div>
      </motion.header>

      /* Profile Modal */
      /
    </>
  )
}
