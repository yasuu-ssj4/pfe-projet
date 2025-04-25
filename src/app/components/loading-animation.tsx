"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function LoadingAnimation() {
  const [showAnimation, setShowAnimation] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 3000) // Animation will show for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!showAnimation) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#002866]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="bg-[#D3D31B] px-8 py-4 rounded-lg shadow-lg">
            <motion.h1
              className="text-5xl font-bold text-[#002866]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              NAFTAL
            </motion.h1>
          </div>
        </motion.div>
        
        <motion.p
          className="text-xl text-white mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Bienvenue dans votre système de gestion
        </motion.p>
        
        <motion.div
          className="mt-8 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="w-3 h-3 bg-[#D3D31B] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-[#D3D31B] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-[#D3D31B] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
