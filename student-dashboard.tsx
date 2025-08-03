"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getStoredCredentials, authenticatedApiCall } from "./student-login"
import DashboardHeader from "./dashboard-header"
import AttendanceAnalytics from "./attendance-analytics"

interface StudentProfile {
  student?: {
    name?: string
  }
  name: string
  htno: string
  course: string | { id: string; code: string; name?: string }
  branch: string | { id: string; code: string; name?: string }
  year: string | number
  section: string | { id: string; code: string; name?: string }
  hallTicketNo?: string
  rollNo?: string
  studentId?: string
}

interface AttendanceData {
  overall_percentage: number
  total_classes: number
  attended_classes: number
}

interface TimetableEntry {
  period: string | number
  subject: string | { id: string; code: string; name?: string }
  faculty: string | { id: string; name: string }
  time?: string
}

interface DashboardData {
  profile: StudentProfile | null
  attendance: AttendanceData | null
  timetable: TimetableEntry[]
  loading: boolean
  error: string
}

// Helper function to extract display value from object or string
const getDisplayValue = (value: any): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  if (typeof value === "object") {
    // Try different possible properties for display
    return value.name || value.code || value.title || value.id || ""
  }
  return String(value)
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    attendance: null,
    timetable: [],
    loading: true, // Start as loading
    error: "",
  })

  const [hasCredentials, setHasCredentials] = useState(false) // Track if credentials are confirmed client-side

  useEffect(() => {
    const { username, password } = getStoredCredentials()
    if (!username || !password) {
      window.location.href = "/login"
      return
    }
    setHasCredentials(true) // Credentials found, proceed
    fetchDashboardData()
  }, []) // Run once on client mount

  const fetchDashboardData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: "" }))

      // Fetch all data in parallel
      const [profileResponse, overallResponse, timetableResponse] = await Promise.allSettled([
        authenticatedApiCall("/profile"),
        authenticatedApiCall("/overall"),
        authenticatedApiCall("/timetable"),
      ])

      let profile = null
      let attendance = null
      let timetable: TimetableEntry[] = []

      // Process profile data
      if (profileResponse.status === "fulfilled") {
        const profileData = profileResponse.value
        console.log("Profile data structure:", JSON.stringify(profileData, null, 2)) // Enhanced debug log

        // Handle different possible profile data structures
        if (profileData && typeof profileData === "object") {
          // If profile data is nested in a payload or data field
          profile = profileData.payload || profileData.data || profileData
        } else {
          profile = profileData
        }

        console.log("Processed profile:", profile) // Debug processed profile
      }

      // Process attendance data
      if (overallResponse.status === "fulfilled") {
        const attendanceData = overallResponse.value
        console.log("Attendance data:", attendanceData) // Debug log

        // Handle the specific API structure: {"Error":false,"payload":{"overallAttendance":"59.57",...}}
        if (attendanceData && !attendanceData.Error && attendanceData.payload) {
          const payload = attendanceData.payload
          const overallPercentage = Number.parseFloat(payload.overallAttendance) || 0

          // Calculate total and attended from attendance details
          let totalClasses = 0
          let attendedClasses = 0

          if (payload.attendanceDetails && Array.isArray(payload.attendanceDetails)) {
            payload.attendanceDetails.forEach((day: any) => {
              if (day.periods && Array.isArray(day.periods)) {
                day.periods.forEach((period: any) => {
                  if (period.status !== undefined) {
                    totalClasses++
                    if (period.status === 1) {
                      // 1 = present
                      attendedClasses++
                    }
                  }
                })
              }
            })
          }

          attendance = {
            overall_percentage: overallPercentage,
            total_classes: totalClasses,
            attended_classes: attendedClasses,
          }
        }
      }

      // Process timetable data
      if (timetableResponse.status === "fulfilled") {
        const timetableData = timetableResponse.value
        console.log("Timetable data:", timetableData) // Debug log

        if (Array.isArray(timetableData)) {
          // Get today's day name
          const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()

          // Find today's schedule
          const todaySchedule = timetableData.find((day) => day.dayname === today)

          if (todaySchedule && todaySchedule.periods && Array.isArray(todaySchedule.periods)) {
            // Convert periods object to array format and take first 4
            timetable = todaySchedule.periods.slice(0, 4).map((period: any, index: number) => {
              // Each period is an object like {"Period 1": "SUBJECT", "faculty": "TEACHER"}
              const periodKeys = Object.keys(period).filter((key) => key.startsWith("Period"))
              const periodNumber = periodKeys[0] || `Period ${index + 1}`
              const subject = period[periodNumber] || "Unknown Subject"
              const faculty = period.faculty || "Unknown Faculty"

              return {
                period: periodNumber.replace("Period ", ""),
                subject: subject,
                faculty: faculty,
              }
            })
          }
        }
      }

      setData({
        profile,
        attendance,
        timetable,
        loading: false,
        error: "",
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard data. Please try again.",
      }))
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage < 75) return "text-red-500"
    if (percentage < 85) return "text-yellow-500"
    return "text-green-500"
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage < 75) return "🔴 Low Attendance"
    if (percentage < 85) return "🟡 Average Attendance"
    return "🟢 Good Attendance"
  }

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[new Date().getDay()]
  }

  if (data.loading || !hasCredentials) {
    return (
      <div className="min-h-screen bg-black">
        {/* Render DashboardHeader with loading state or null profile */}
        <DashboardHeader profile={null} />
        <div className="flex items-center justify-center py-20">
          <motion.div className="text-white text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0, y: 20 }} // Initial state: slightly transparent, slightly below
      animate={{ opacity: 1, y: 0 }} // Animate to: fully opaque, original position
      transition={{ duration: 0.5, ease: "easeOut" }} // Animation duration and easing
    >
      {/* Header */}
      <DashboardHeader profile={data.profile} />

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Error Message */}
        {data.error && (
          <motion.div
            className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{data.error}</p>
          </motion.div>
        )}

        {/* Attendance Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span>📊</span>
                <h2 className="text-lg font-semibold text-white">Overall Attendance</h2>
              </div>
              <div className="text-center space-y-2">
                <div className={`text-4xl font-bold ${getAttendanceColor(data.attendance?.overall_percentage || 0)}`}>
                  {data.attendance?.overall_percentage?.toFixed(2) || "0.00"}%
                </div>
                <p className="text-sm text-gray-400">{getAttendanceStatus(data.attendance?.overall_percentage || 0)}</p>
                {data.attendance && (
                  <p className="text-xs text-gray-500">
                    {data.attendance.attended_classes} / {data.attendance.total_classes} classes attended
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Analytics - Enhanced Component */}
        {data.attendance && (
          <AttendanceAnalytics
            currentPercentage={data.attendance.overall_percentage}
            totalClasses={data.attendance.total_classes}
            attendedClasses={data.attendance.attended_classes}
          />
        )}

        {/* Today's Timetable */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span>🗓️</span>
                <h2 className="text-lg font-semibold text-white">Today's Timetable ({getCurrentDay()})</h2>
              </div>
              <div className="space-y-3">
                {data.timetable.length > 0 ? (
                  data.timetable.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-xs font-semibold">
                        {getDisplayValue(entry.period) || index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{getDisplayValue(entry.subject) || "Subject"}</p>
                        <p className="text-gray-400 text-sm">{getDisplayValue(entry.faculty) || "Faculty"}</p>
                      </div>
                      {entry.time && <div className="text-gray-400 text-xs">{getDisplayValue(entry.time)}</div>}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No timetable data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </motion.div>
  )
}
