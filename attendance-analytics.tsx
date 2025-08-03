"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Target, AlertTriangle, Calendar, Calculator, TrendingDown, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AttendanceAnalyticsProps {
  currentPercentage: number
  totalClasses: number
  attendedClasses: number
}

export default function AttendanceAnalytics({
  currentPercentage,
  totalClasses,
  attendedClasses,
}: AttendanceAnalyticsProps) {
  const [classesToMissInput, setClassesToMissInput] = useState<string>("") // Input for classes to miss
  const [avgClassesPerDay, setAvgClassesPerDay] = useState<string>("8") // Global average classes per day, default 8
  const [showCalculator, setShowCalculator] = useState(false)

  // Parse avgClassesPerDay to a number, default to 1 to prevent division by zero
  const parsedAvgClassesPerDay = Number(avgClassesPerDay) || 1

  // Calculate classes needed to reach target percentages
  const calculateClassesNeeded = (targetPercentage: number): number => {
    if (currentPercentage >= targetPercentage) return 0
    const classesNeeded = Math.ceil(
      (targetPercentage * totalClasses - 100 * attendedClasses) / (100 - targetPercentage),
    )
    return Math.max(0, classesNeeded)
  }

  // Calculate impact of missing a specific number of classes
  const calculateAbsenceImpact = (numClassesToMiss: number) => {
    const newTotalClasses = totalClasses + numClassesToMiss
    const newPercentage = (attendedClasses / newTotalClasses) * 100

    return {
      missedClasses: numClassesToMiss,
      newTotalClasses,
      newPercentage,
      percentageDrop: currentPercentage - newPercentage,
    }
  }

  // Calculate days needed to reach target based on average classes per day
  const calculateDaysNeeded = (targetPercentage: number): number => {
    const classesNeeded = calculateClassesNeeded(targetPercentage)
    return Math.ceil(classesNeeded / parsedAvgClassesPerDay)
  }

  // Get attendance insights
  const getAttendanceInsights = () => {
    const insights = []

    if (currentPercentage < 65) {
      insights.push({
        type: "critical",
        icon: AlertTriangle,
        title: "Critical Attendance Alert",
        message: "Your attendance is below minimum requirement. Immediate action needed!",
        color: "text-red-400",
      })
    } else if (currentPercentage < 75) {
      insights.push({
        type: "warning",
        icon: Target,
        title: "Attendance Warning",
        message: "You're below the recommended 75%. Focus on attending more classes.",
        color: "text-yellow-400",
      })
    } else {
      insights.push({
        type: "good",
        icon: TrendingUp,
        title: "Good Attendance",
        message: "Great job! Keep maintaining your attendance above 75%.",
        color: "text-green-400",
      })
    }

    // Add specific insights based on data
    const missedClasses = totalClasses - attendedClasses
    if (missedClasses > attendedClasses) {
      insights.push({
        type: "info",
        icon: Calculator,
        title: "Missed More Than Attended",
        message: `You've missed ${missedClasses} classes vs ${attendedClasses} attended.`,
        color: "text-blue-400",
      })
    }

    return insights
  }

  const classesFor75 = calculateClassesNeeded(75)
  const classesFor65 = calculateClassesNeeded(65)
  const daysFor75 = calculateDaysNeeded(75)
  const daysFor65 = calculateDaysNeeded(65)

  const numClassesToMiss = Number(classesToMissInput) || 0 // Convert input to number for calculation
  const absenceImpact = calculateAbsenceImpact(numClassesToMiss)
  const insights = getAttendanceInsights()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <span>📊</span>
            Attendance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Insights Section */}
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon
              return (
                <motion.div
                  key={index}
                  className={`flex items-start gap-3 p-3 bg-gray-800 rounded-lg`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <IconComponent className={`h-5 w-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                  <div>
                    <h4 className={`font-semibold ${insight.color} text-sm`}>{insight.title}</h4>
                    <p className="text-gray-300 text-xs mt-1">{insight.message}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Target Analysis */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Analysis
            </h3>

            {/* 75% Target */}
            <motion.div
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-900 rounded-lg">
                  <span className="text-green-400 font-bold text-sm">75%</span>
                </div>
                <div>
                  <p className="text-white font-medium">Good Attendance</p>
                  <p className="text-gray-400 text-xs">Recommended minimum</p>
                </div>
              </div>
              <div className="text-right">
                {currentPercentage >= 75 ? (
                  <div className="text-green-400 font-semibold">✅ Achieved</div>
                ) : (
                  <div>
                    <div className="text-white font-semibold">{classesFor75} classes</div>
                    <div className="text-gray-400 text-xs">≈ {daysFor75} days</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 65% Target */}
            <motion.div
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-900 rounded-lg">
                  <span className="text-yellow-400 font-bold text-sm">65%</span>
                </div>
                <div>
                  <p className="text-white font-medium">Minimum Required</p>
                  <p className="text-gray-400 text-xs">Basic requirement</p>
                </div>
              </div>
              <div className="text-right">
                {currentPercentage >= 65 ? (
                  <div className="text-yellow-400 font-semibold">✅ Achieved</div>
                ) : (
                  <div>
                    <div className="text-white font-semibold">{classesFor65} classes</div>
                    <div className="text-gray-400 text-xs">≈ {daysFor65} days</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Absence Impact Calculator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Absence Impact Calculator
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-gray-400 hover:text-white"
              >
                {showCalculator ? "Hide" : "Show"}
              </Button>
            </div>

            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-4 p-4 bg-gray-800 rounded-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="classesToMiss" className="text-white text-sm">
                    Number of Classes to Miss
                  </Label>
                  <Input
                    id="classesToMiss"
                    type="number"
                    min="0"
                    value={classesToMissInput}
                    onChange={(e) => setClassesToMissInput(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="e.g., 5, 10, 15"
                  />
                </div>

                {numClassesToMiss > 0 && (
                  <motion.div
                    key={classesToMissInput} // Animate when input changes
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-red-400">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-semibold">Impact of Missing {numClassesToMiss} Class(es)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="text-gray-400">Classes Missed</div>
                        <div className="text-white font-semibold text-lg">{absenceImpact.missedClasses}</div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="text-gray-400">New Percentage</div>
                        <div className="text-red-400 font-semibold text-lg">
                          {absenceImpact.newPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="text-gray-400">Classes for 75%</div>
                        <div className="text-white font-semibold text-lg">{classesFor75} more classes</div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="text-gray-400">Classes for 65%</div>
                        <div className="text-white font-semibold text-lg">{classesFor65} more classes</div>
                      </div>
                    </div>

                    <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Your attendance will drop by {absenceImpact.percentageDrop.toFixed(2)}% if you miss{" "}
                          {numClassesToMiss} class(es)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quick Stats
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-green-400 font-semibold text-lg">{attendedClasses}</div>
                <div className="text-gray-400 text-xs">Attended</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-red-400 font-semibold text-lg">{totalClasses - attendedClasses}</div>
                <div className="text-gray-400 text-xs">Missed</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-white font-semibold text-lg">{totalClasses}</div>
                <div className="text-gray-400 text-xs">Total</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recommendations
            </h3>

            <div className="space-y-2 text-sm">
              {currentPercentage < 75 && (
                <motion.div
                  className="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 p-3 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-blue-400 font-medium mb-1">📚 Study Plan</div>
                  <div className="text-gray-300">
                    Attend the next {classesFor75} classes consistently to reach 75% attendance.
                  </div>
                </motion.div>
              )}

              <motion.div
                className="bg-purple-900 bg-opacity-20 border border-purple-500 border-opacity-30 p-3 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="text-purple-400 font-medium mb-1">⏰ Time Management</div>
                <div className="text-gray-300">
                  Set reminders for classes and avoid missing more than 1 day per week.
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
