"use client"

import { motion } from "framer-motion"
import { TrendingUp, Target, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AttendancePredictorProps {
  currentPercentage: number
  totalClasses: number
  attendedClasses: number
}

export default function AttendancePredictor({
  currentPercentage,
  totalClasses,
  attendedClasses,
}: AttendancePredictorProps) {
  // Calculate classes needed to reach target percentages
  const calculateClassesNeeded = (targetPercentage: number): number => {
    if (currentPercentage >= targetPercentage) return 0

    // Formula: (attendedClasses + x) / (totalClasses + x) = targetPercentage/100
    // Solving for x: x = (targetPercentage * totalClasses - 100 * attendedClasses) / (100 - targetPercentage)
    const classesNeeded = Math.ceil(
      (targetPercentage * totalClasses - 100 * attendedClasses) / (100 - targetPercentage),
    )

    return Math.max(0, classesNeeded)
  }

  const classesFor75 = calculateClassesNeeded(75)
  const classesFor65 = calculateClassesNeeded(65)

  const getStatusMessage = () => {
    if (currentPercentage >= 75) {
      return {
        message: "Great! You're maintaining good attendance",
        color: "text-green-400",
        icon: TrendingUp,
      }
    } else if (currentPercentage >= 65) {
      return {
        message: "You're on track, but can improve",
        color: "text-yellow-400",
        icon: Target,
      }
    } else {
      return {
        message: "Attention needed to improve attendance",
        color: "text-red-400",
        icon: AlertTriangle,
      }
    }
  }

  const status = getStatusMessage()
  const StatusIcon = status.icon

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <span>🎯</span>
            Attendance Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Message */}
          <div className={`flex items-center gap-2 ${status.color} text-sm font-medium`}>
            <StatusIcon className="h-4 w-4" />
            <span>{status.message}</span>
          </div>

          {/* Predictions */}
          <div className="space-y-3">
            {/* 75% Target */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-900 rounded-lg">
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
                    <div className="text-gray-400 text-xs">to reach 75%</div>
                  </div>
                )}
              </div>
            </div>

            {/* 65% Target */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-900 rounded-lg">
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
                    <div className="text-gray-400 text-xs">to reach 65%</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="pt-3 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="text-white font-semibold">{attendedClasses}</div>
                <div className="text-gray-400">Attended</div>
              </div>
              <div>
                <div className="text-white font-semibold">{totalClasses - attendedClasses}</div>
                <div className="text-gray-400">Missed</div>
              </div>
              <div>
                <div className="text-white font-semibold">{totalClasses}</div>
                <div className="text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
