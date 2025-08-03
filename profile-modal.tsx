"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentProfile {
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

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: StudentProfile | null
  username: string
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

const getProfileImageUrl = (profile: StudentProfile | null) => {
  if (!profile) return undefined

  // Try different possible field names for hall ticket number
  const htno = profile.htno || profile.hallTicketNo || profile.rollNo || profile.studentId

  if (htno) {
    return `https://psapi.kmitonline.com/public/student_images/KMCE/${htno}`
  }

  return undefined
}

export default function ProfileModal({ isOpen, onClose, profile, username }: ProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            initial={{ opacity: 0, scale: 0.9, y: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-50%" }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 pb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-white/20">
                    <AvatarImage src={getProfileImageUrl(profile) || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback className="bg-gray-700 text-white">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white mb-1">
                      Welcome, {getDisplayValue(profile?.name) || "Student"}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-sm">🆔</span>
                      <p className="text-sm">
                        HT No:{" "}
                        {getDisplayValue(profile?.htno) ||
                          getDisplayValue(profile?.hallTicketNo) ||
                          getDisplayValue(profile?.rollNo) ||
                          getDisplayValue(profile?.studentId) ||
                          username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Course */}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg">
                      <span className="text-lg">🎓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Course</p>
                      <p className="text-white font-semibold">{getDisplayValue(profile?.course) || "B.TECH"}</p>
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600/20 rounded-lg">
                      <span className="text-lg">🧑‍💻</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Branch</p>
                      <p className="text-white font-semibold">
                        {getDisplayValue(profile?.branch) || "COMPUTER SCIENCE AND ENGINEERING"}
                      </p>
                    </div>
                  </div>

                  {/* Year and Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-600/20 rounded-lg">
                        <span className="text-lg">📅</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Year</p>
                        <p className="text-white font-semibold">{getDisplayValue(profile?.year) || "3"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-600/20 rounded-lg">
                        <span className="text-lg">📁</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Section</p>
                        <p className="text-white font-semibold">{getDisplayValue(profile?.section) || "A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
