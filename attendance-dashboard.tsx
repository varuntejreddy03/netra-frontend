"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, AlertTriangle, BookOpen, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoredCredentials, authenticatedApiCall } from "./student-login"

interface OverallAttendance {
  overall_percentage?: number
  total_classes?: number
  attended_classes?: number
}

interface Subject {
  id: string
  name: string
  code: string
  total_sessions: number
  attended_sessions: number
  attendance_percentage: number
}

interface AttendanceData {
  overall: OverallAttendance | null
  subjects: Subject[]
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

// Helper function to extract numeric value
const getNumericValue = (value: any): number => {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number.parseFloat(value) || 0
  if (typeof value === "object" && value !== null) {
    if (value.value !== undefined) return Number.parseFloat(value.value) || 0
    if (value.percentage !== undefined) return Number.parseFloat(value.percentage) || 0
  }
  return 0
}

// Safe function to get percentage with fallback
const getPercentage = (value: any): number => {
  const num = getNumericValue(value)
  return Number.isNaN(num) ? 0 : num
}

export default function AttendanceDashboard() {
  const [data, setData] = useState<AttendanceData>({
    overall: null,
    subjects: [],
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
    fetchAttendanceData()
  }, []) // Run once on client mount

  const fetchAttendanceData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: "" }))

      // Fetch both APIs in parallel
      const [overallResponse, subjectsResponse] = await Promise.allSettled([
        authenticatedApiCall("/overall"),
        authenticatedApiCall("/subjects"),
      ])

      let overall = null
      let subjects: Subject[] = []

      // Process overall attendance data
      if (overallResponse.status === "fulfilled") {
        const overallData = overallResponse.value
        console.log("Overall attendance data:", overallData)

        // Handle the specific API structure: {"Error":false,"payload":{"overallAttendance":"59.57",...}}
        if (overallData && !overallData.Error && overallData.payload) {
          const payload = overallData.payload
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

          overall = {
            overall_percentage: overallPercentage,
            total_classes: totalClasses,
            attended_classes: attendedClasses,
          }
        }
      } else {
        console.error("Failed to fetch overall attendance:", overallResponse.reason)
      }

      // Process subjects data - handle the array structure directly
      if (subjectsResponse.status === "fulfilled") {
        const subjectsData = subjectsResponse.value
        console.log("Subjects data:", subjectsData)

        if (Array.isArray(subjectsData)) {
          subjects = subjectsData.map((subject, index) => ({
            id: index.toString(),
            name: subject.subjectName || `Subject ${index + 1}`,
            code: subject.subjectType || "",
            total_sessions: Number.parseInt(subject.totalSessions) || 0,
            attended_sessions: Number.parseInt(subject.attendedSessions) || 0,
            attendance_percentage: Number.parseFloat(subject.attendancePercentage) || 0,
          }))
        }
      } else {
        console.error("Failed to fetch subjects:", subjectsResponse.reason)
      }

      setData({
        overall,
        subjects,
        loading: false,
        error: "",
      })
    } catch (error) {
      console.error("Failed to fetch attendance data:", error)
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load attendance data. Please try again.",
      }))
    }
  }

  const getAttendanceColor = (percentage: number) => {
    return percentage < 75 ? "text-red-500" : "text-white"
  }

  const getProgressColor = (percentage: number) => {
    return percentage < 75 ? "bg-red-500" : "bg-green-500"
  }

  const isLowAttendance = (percentage: number) => {
    return percentage < 75
  }

  // Safe percentage display
  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return "0.00"
    }
    return value.toFixed(2)
  }

  if (data.loading || !hasCredentials) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div className="text-white text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading attendance data...</p>
        </motion.div>
      </div>
    )
  }

  const overallPercentage = data.overall?.overall_percentage ?? 0

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Attendance</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Error Message */}
          {data.error && (
            <motion.div
              className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{data.error}</p>
            </motion.div>
          )}

          {/* Section 1: Overall Attendance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <span>🧾</span>
                  Overall Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.overall ? (
                  <>
                    <div className="text-center space-y-2">
                      <div className={`text-4xl font-bold ${getAttendanceColor(overallPercentage)}`}>
                        {formatPercentage(overallPercentage)}%
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(overallPercentage)}`}
                          style={{ width: `${Math.min(Math.max(overallPercentage, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {isLowAttendance(overallPercentage) && (
                      <motion.div
                        className="flex items-center justify-center gap-2 text-red-400 text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        ⚠️ Low attendance
                      </motion.div>
                    )}

                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Classes Attended: {data.overall.attended_classes ?? 0}</span>
                      <span>Total Classes: {data.overall.total_classes ?? 0}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No overall attendance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Subject-wise Attendance List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <span>📚</span>
                Subject-wise Attendance
              </h2>

              {data.subjects.length > 0 ? (
                <div className="space-y-3">
                  {data.subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Subject Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white text-lg">
                                  {subject.name || "Unknown Subject"}
                                </h3>
                                {subject.code && <p className="text-gray-400 text-sm">{subject.code}</p>}
                              </div>
                              <div className={`text-xl font-bold ${getAttendanceColor(subject.attendance_percentage)}`}>
                                {formatPercentage(subject.attendance_percentage)}%
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(subject.attendance_percentage)}`}
                                style={{ width: `${Math.min(Math.max(subject.attendance_percentage, 0), 100)}%` }}
                              ></div>
                            </div>

                            {/* Session Details */}
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>Attended: {subject.attended_sessions}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Total: {subject.total_sessions}</span>
                                </div>
                              </div>

                              {isLowAttendance(subject.attendance_percentage) && (
                                <div className="flex items-center gap-1 text-red-400 text-xs">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Low</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8">
                    <div className="text-center text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No subject attendance data available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Footer spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}
