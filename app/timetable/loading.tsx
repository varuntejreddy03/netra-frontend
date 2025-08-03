"use client"

import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div className="text-white text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading timetable...</p>
      </motion.div>
    </div>
  )
}
