"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function SalutationAnimation() {
  const [greeting, setGreeting] = useState("")
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {

    const hour = new Date().getHours()
    let greetingText = ""

    if (hour >= 5 && hour < 12) {
      greetingText = "Bonjour"
    } else if (hour >= 12 && hour < 18) {
      greetingText = "Bon après-midi"
    } else {
      greetingText = "Bonsoir"
    }

    setGreeting(greetingText)

    // Set current time
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )

      setDate(
        now.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {greeting}
        </motion.h1>

        <motion.div
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p>{time}</p>
          <p className="capitalize">{date}</p>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <p className="text-xl font-medium text-gray-700 mb-2">Bienvenue au système de gestion</p>
          <p className="text-lg text-gray-500">Veuillez vous connecter pour continuer</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          className="w-24 h-24 border-4 border-[#D3D31B] rounded-full mb-4 mx-auto flex items-center justify-center"
          animate={{
            boxShadow: [
              "0px 0px 0px rgba(211,211,27,0)",
              "0px 0px 20px rgba(211,211,27,0.5)",
              "0px 0px 0px rgba(211,211,27,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <svg className="w-12 h-12 text-[#D3D31B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
