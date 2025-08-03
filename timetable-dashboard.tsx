"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, User, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoredCredentials, authenticatedApiCall } from "./student-login"

interface Period {
  periodNumber: string
  subject: string
  faculty: string
}

interface DaySchedule {
  dayname: string
  periods: Period[]
}

interface TimetableData {
  schedule: DaySchedule[]
  loading: boolean
  error: string
}

// Time slots for each period
const TIME_SLOTS = [
  "9:00 - 9:50",
  "9:50 - 10:40",
  "10:40 - 11:30",
  "11:30 - 12:20",
  "12:20 - 1:10",
  "1:10 - 2:00",
  "2:00 - 2:50",
  "2:50 - 3:40",
]

export default function TimetableDashboard() {
  const [data, setData] = useState<TimetableData>({
    schedule: [],
    loading: true, // Start as loading
    error: "",
  })

  const [selectedDay, setSelectedDay] = useState<string>("")
  const [hasCredentials, setHasCredentials] = useState(false) // Track if credentials are confirmed client-side

  useEffect(() => {
    const { username, password } = getStoredCredentials()
    if (!username || !password) {
      window.location.href = "/login"
      return
    }
    setHasCredentials(true) // Credentials found, proceed

    // Set today as default selected day
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
    setSelectedDay(today)

    fetchTimetableData()
  }, []) // Run once on client mount

  const fetchTimetableData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: "" }))

      const timetableResponse = await authenticatedApiCall("/timetable")
      console.log("Timetable data:", timetableResponse)

      let schedule: DaySchedule[] = []

      if (Array.isArray(timetableResponse)) {
        schedule = timetableResponse.map((day) => {
          const periods: Period[] = []

          if (day.periods && Array.isArray(day.periods)) {
            day.periods.forEach((period: any) => {
              // Each period is an object like {"Period 1": "SUBJECT", "faculty": "TEACHER"}
              const periodKeys = Object.keys(period).filter((key) => key.startsWith("Period"))

              if (periodKeys.length > 0) {
                const periodKey = periodKeys[0]
                const periodNumber = periodKey.replace("Period ", "")
                const subject = period[periodKey] || "Unknown Subject"
                const faculty = period.faculty || "Unknown Faculty"

                periods.push({
                  periodNumber,
                  subject,
                  faculty,
                })
              }
            })
          }

          return {
            dayname: day.dayname || "Unknown Day",
            periods,
          }
        })
      }

      setData({
        schedule,
        loading: false,
        error: "",
      })
    } catch (error) {
      console.error("Failed to fetch timetable data:", error)
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load timetable data. Please try again.",
      }))
    }
  }

  const getCurrentDay = () => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
  }

  const isToday = (dayname: string) => {
    return dayname === getCurrentDay()
  }

  const getSelectedDaySchedule = () => {
    return data.schedule.find((day) => day.dayname === selectedDay)
  }

  if (data.loading || !hasCredentials) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div className="text-white text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading timetable...</p>
        </motion.div>
      </div>
    )
  }

  const selectedDaySchedule = getSelectedDaySchedule()

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Timetable</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Error Message */}
          {data.error && (
            <motion.div
              className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{data.error}</p>
            </motion.div>
          )}

          {/* Day Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Calendar className="h-5 w-5" />
                Select Day
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {data.schedule.map((day, index) => (
                  <motion.button
                    key={day.dayname}
                    onClick={() => setSelectedDay(day.dayname)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedDay === day.dayname ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"
                    } ${isToday(day.dayname) ? "ring-2 ring-blue-500" : ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    {day.dayname.slice(0, 3)}
                    {isToday(day.dayname) && <div className="text-xs mt-1 opacity-75">Today</div>}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Selected Day Schedule */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <span>📅</span>
                  {selectedDay} Schedule
                  {isToday(selectedDay) && <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">Today</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDaySchedule && selectedDaySchedule.periods.length > 0 ? (
                  selectedDaySchedule.periods.map((period, index) => (
                    <motion.div
                      key={`${selectedDay}-${period.periodNumber}`}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {/* Period Number & Time */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-xs font-semibold mb-1">
                          {period.periodNumber}
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          {TIME_SLOTS[Number.parseInt(period.periodNumber) - 1] || ""}
                        </div>
                      </div>

                      {/* Subject & Faculty */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{period.subject}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <User className="h-3 w-3" />
                          <span>{period.faculty}</span>
                        </div>
                      </div>

                      {/* Current Period Indicator */}
                      {isToday(selectedDay) && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No classes scheduled for {selectedDay}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          {selectedDaySchedule && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{selectedDaySchedule.periods.length}</div>
                      <div className="text-xs text-gray-400">Total Periods</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {new Set(selectedDaySchedule.periods.map((p) => p.subject)).size}
                      </div>
                      <div className="text-xs text-gray-400">Unique Subjects</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Footer spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}
