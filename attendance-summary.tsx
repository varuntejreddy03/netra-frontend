"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Search, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getStoredCredentials, authenticatedApiCall } from "./student-login"

interface PeriodStatus {
  period_no: number
  status: number // 0 = absent, 1 = present, 2 = not marked
}

interface DayAttendance {
  date: string
  periods: PeriodStatus[]
}

interface AttendanceSummaryData {
  overallPercentage: number
  attendanceDetails: DayAttendance[]
  loading: boolean
  error: string
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (dateString === "Today") return "Today"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

// Helper function to get day attendance percentage
const getDayAttendancePercentage = (periods: PeriodStatus[]): number => {
  const totalPeriods = periods.length
  const presentPeriods = periods.filter((p) => p.status === 1).length
  return totalPeriods > 0 ? (presentPeriods / totalPeriods) * 100 : 0
}

// Helper function to get attendance status
const getAttendanceStatus = (percentage: number): { text: string; color: string; icon: any } => {
  if (percentage >= 75) {
    return { text: "Good", color: "text-green-500", icon: TrendingUp }
  } else if (percentage >= 50) {
    return { text: "Average", color: "text-yellow-500", icon: Minus }
  } else {
    return { text: "Poor", color: "text-red-500", icon: TrendingDown }
  }
}

// Helper function to get period status display
const getPeriodStatusDisplay = (status: number): { emoji: string; color: string; text: string } => {
  switch (status) {
    case 1:
      return { emoji: "✅", color: "bg-green-500", text: "Present" }
    case 0:
      return { emoji: "❌", color: "bg-red-500", text: "Absent" }
    case 2:
      return { emoji: "⏳", color: "bg-gray-500", text: "Not Marked" }
    default:
      return { emoji: "❓", color: "bg-gray-500", text: "Unknown" }
  }
}

export default function AttendanceSummary() {
  const [data, setData] = useState<AttendanceSummaryData>({
    overallPercentage: 0,
    attendanceDetails: [],
    loading: true, // Start as loading
    error: "",
  })

  const [searchDate, setSearchDate] = useState("")
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

      const response = await authenticatedApiCall("/overall")
      console.log("Attendance summary data:", response)

      if (response && !response.Error && response.payload) {
        const payload = response.payload
        const overallPercentage = Number.parseFloat(payload.overallAttendance) || 0
        const attendanceDetails = payload.attendanceDetails || []

        // Get last 7 days (excluding "Today" if it exists)
        const filteredDetails = attendanceDetails
          .filter((day: any) => day.date !== "Today")
          .slice(0, 7)
          .reverse() // Show most recent first

        setData({
          overallPercentage,
          attendanceDetails: filteredDetails,
          loading: false,
          error: "",
        })
      } else {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load attendance data",
        }))
      }
    } catch (error) {
      console.error("Failed to fetch attendance summary:", error)
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load attendance data. Please try again.",
      }))
    }
  }

  const filteredData = data.attendanceDetails.filter((day) =>
    searchDate ? day.date.toLowerCase().includes(searchDate.toLowerCase()) : true,
  )

  // Show loading spinner if data is still loading or credentials are not yet confirmed
  if (data.loading || !hasCredentials) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div className="text-white text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading attendance summary...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-black border-b border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Attendance Summary</h1>
              <p className="text-gray-400 text-sm">View your attendance history and statistics</p>
            </div>
          </div>

          {/* Tracking Since */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
            <Calendar className="h-4 w-4" />
            <span>Tracking since: Jul 24, 2025</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by date..."
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Overall Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <span>📊</span>
                  Overall Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{data.overallPercentage.toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        data.overallPercentage >= 75
                          ? "bg-green-500"
                          : data.overallPercentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(data.overallPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Last Week Attendance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <span>📅</span>
                Last Week Attendance
              </h2>

              {filteredData.length > 0 ? (
                <div className="space-y-3">
                  {filteredData.map((day, index) => {
                    const dayPercentage = getDayAttendancePercentage(day.periods)
                    const status = getAttendanceStatus(dayPercentage)
                    const StatusIcon = status.icon

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Card className="bg-gray-900 border-gray-800">
                          <CardContent className="p-4">
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-white">{formatDate(day.date)}</h3>
                                <p className="text-sm text-gray-400">{day.periods.length} periods</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${status.color} flex items-center gap-1`}>
                                  <StatusIcon className="h-4 w-4" />
                                  {dayPercentage.toFixed(0)}%
                                </div>
                                <p className={`text-xs ${status.color}`}>{status.text}</p>
                              </div>
                            </div>

                            {/* Period Status Grid */}
                            <div className="grid grid-cols-8 gap-2">
                              {day.periods.map((period) => {
                                const periodStatus = getPeriodStatusDisplay(period.status)
                                return (
                                  <div
                                    key={period.period_no}
                                    className="flex flex-col items-center"
                                    title={`Period ${period.period_no}: ${periodStatus.text}`}
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full ${periodStatus.color} flex items-center justify-center text-xs text-white font-semibold mb-1`}
                                    >
                                      {period.period_no}
                                    </div>
                                    <span className="text-xs">{periodStatus.emoji}</span>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Day Summary */}
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>Present: {day.periods.filter((p) => p.status === 1).length}</span>
                                <span>Absent: {day.periods.filter((p) => p.status === 0).length}</span>
                                <span>Not Marked: {day.periods.filter((p) => p.status === 2).length}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8">
                    <div className="text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-lg mb-2">No attendance records found</p>
                      <p className="text-sm">Start by adding daily attendance</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Present ✅</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">Absent ❌</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-300">Not Marked ⏳</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}
