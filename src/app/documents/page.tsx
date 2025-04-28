"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Car, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DocumentsPage() {
  const router = useRouter()
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null)

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Situation d'immobilisation */}
      <motion.div
        className="relative w-1/2 h-full flex items-center justify-center cursor-pointer overflow-hidden"
        style={{
          backgroundColor: "#0a2d5e", // Dark blue (Naftal color)
        }}
        initial={{ opacity: 0.9 }}
        animate={{
          opacity: 1,
          width: hoveredSide === "left" ? "55%" : hoveredSide === "right" ? "45%" : "50%",
        }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setHoveredSide("left")}
        onHoverEnd={() => setHoveredSide(null)}
        onClick={() => handleNavigate("/documents/immobilisation")}
      >
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] opacity-10 bg-cover bg-center" />
        <motion.div
          className="relative z-10 text-center p-8 bg-black/20 backdrop-blur-sm rounded-xl max-w-md"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Car className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold text-white mb-4">Situation d&apos;immobilisation</h2>
          <p className="text-gray-200 mb-6">Accédez à la liste des véhicules immobilisés et leurs statuts</p>
          <div className="flex items-center justify-center text-yellow-400 font-semibold">
            <span>Voir les détails</span>
            <ChevronRight className="ml-2" />
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Programme d'entretien */}
      <motion.div
        className="relative w-1/2 h-full flex items-center justify-center cursor-pointer overflow-hidden"
        style={{
          backgroundColor: "#e6b800", // Dark yellow (Naftal color)
        }}
        initial={{ opacity: 0.9 }}
        animate={{
          opacity: 1,
          width: hoveredSide === "right" ? "55%" : hoveredSide === "left" ? "45%" : "50%",
        }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setHoveredSide("right")}
        onHoverEnd={() => setHoveredSide(null)}
        onClick={() => handleNavigate("/documents/entretien")}
      >
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] opacity-10 bg-cover bg-center" />
        <motion.div
          className="relative z-10 text-center p-8 bg-black/20 backdrop-blur-sm rounded-xl max-w-md"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Wrench className="w-16 h-16 mx-auto mb-4 text-blue-900" />
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Programme d&apos;entretien</h2>
          <p className="text-blue-900 mb-6">Gérez les programmes d&apos;entretien pour votre flotte de véhicules</p>
          <div className="flex items-center justify-center text-blue-900 font-semibold">
            <span>Voir les détails</span>
            <ChevronRight className="ml-2" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
