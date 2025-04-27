"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import naftal_logo from "../lib/Logo_NAFTAL.svg"

export default function LoadingAnimation() {
  const [showAnimation, setShowAnimation] = useState(true)
  const particlesRef = useRef<HTMLDivElement>(null)
  const logoControls = useAnimationControls()
  const textControls = useAnimationControls()

  // Create animated particles
  useEffect(() => {
    if (!particlesRef.current) return

    const particles = Array.from({ length: 40 }).map((_, i) => {
      const particle = document.createElement("div")
      const size = Math.random() * 12 + 5
      particle.className = "absolute rounded-full bg-[#D3D31B]"
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.opacity = `${Math.random() * 0.6 + 0.2}`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      // Add animation
      particle.animate(
        [
          { transform: "translate(0, 0) scale(0)", opacity: 0 },
          { opacity: Math.random() * 0.7 + 0.3, offset: 0.3 },
          {
            transform: `translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 150}px) scale(1)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 3000 + 3000,
          delay: Math.random() * 2000,
          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          iterations: Number.POSITIVE_INFINITY,
        },
      )

      return particle
    })

    particles.forEach((p) => particlesRef.current?.appendChild(p))

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [])

  // Sequence the animations
  useEffect(() => {
    const sequence = async () => {
      // Logo animation
      await logoControls.start({
        scale: [0.5, 1.2, 1],
        opacity: [0, 1],
        rotateY: [180, 0],
        transition: { duration: 2, ease: "easeOut" },
      })

      // Text animation
      await textControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      })

      // Wait for the full animation duration
      setTimeout(() => {
        setShowAnimation(false)
      }, 6000) // Total animation duration: 6 seconds
    }

    sequence()
  }, [logoControls, textControls])

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#001a4d] via-[#002866] to-[#00050f]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              background: [
                "linear-gradient(135deg, #001a4d 0%, #002866 50%, #00050f 100%)",
                "linear-gradient(225deg, #001a4d 0%, #002866 50%, #00050f 100%)",
                "linear-gradient(315deg, #001a4d 0%, #002866 50%, #00050f 100%)",
              ],
            }}
            transition={{
              opacity: { duration: 0.5 },
              background: { duration: 6, repeat: 0, ease: "linear" },
            }}
          />

          {/* Animated particles container */}
          <div ref={particlesRef} className="absolute inset-0 overflow-hidden" />

          {/* Animated circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="absolute w-80 h-80 rounded-full border-2 border-[#D3D31B]/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.8, opacity: [0, 0.3, 0] }}
              transition={{ duration: 4, ease: "easeOut", delay: 1 }}
            />
            <motion.div
              className="absolute w-72 h-72 rounded-full border-2 border-[#D3D31B]/30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.2, opacity: [0, 0.4, 0] }}
              transition={{ duration: 3.5, ease: "easeOut", delay: 1.2 }}
            />
            <motion.div
              className="absolute w-64 h-64 rounded-full border-2 border-[#D3D31B]/40"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.6, opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, ease: "easeOut", delay: 1.5 }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div animate={logoControls} className="relative mb-8">
              <motion.div
                className="absolute inset-[-10px] bg-[#D3D31B] rounded-full blur-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0, 0.7, 0.4, 0.6, 0.4],
                  scale: [0.9, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  times: [0, 0.2, 0.4, 0.6, 1],
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <div className="relative flex items-center justify-center bg-[#D3D31B] p-8 rounded-2xl shadow-[0_0_40px_rgba(211,211,27,0.6)]">
                <motion.img
                  src={naftal_logo.src}
                  alt="Naftal Logo"
                  className="h-28 w-auto"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    filter: ["drop-shadow(0 0 0px rgba(0,0,0,0))", "drop-shadow(0 0 15px rgba(0,0,0,0.4))"],
                  }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.p
              animate={textControls}
              initial={{ opacity: 0, y: 20 }}
              className="text-2xl font-light text-white mt-4 tracking-wider"
            >
              Bienvenue dans votre système de gestion
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              className="mt-12 flex space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 bg-[#D3D31B] rounded-full"
                  animate={{
                    y: ["0%", "-100%", "0%"],
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mt-8 w-64 h-2 bg-white/20 rounded-full overflow-hidden"
              initial={{ opacity: 0, width: "0%" }}
              animate={{ opacity: 1, width: "16rem" }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <motion.div
                className="h-full bg-[#D3D31B]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.5, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
