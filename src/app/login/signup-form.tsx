"use client"
import { useRouter } from "next/navigation"
import type React from "react"
import CryptoJS from "crypto-js"
import { SECRET_KEY } from "../prisma"
import { useState } from "react"
import { ErrorNotification } from "./page"
import { motion } from "framer-motion"
import { Loader2, User, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || "Une erreur s'est produite.")
        setLoading(false)
        return
      }
      
      
     
      
      router.push("/dashboard")
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center p-0 w-[60vw] justify-center min-h-screen bg-[#002866]">
      <ErrorNotification message={errorMessage} />
      <motion.div
        className="ml-[500px] bg-[#D3D31B] p-8 rounded-2xl shadow-xl w-96 absolute left-40 top-15 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-2xl font-bold text-center mb-6 text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Connexion
        </motion.h2>

        <motion.form
          onSubmit={handleLogin}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label htmlFor="username" className="block font-semibold text-gray-800">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002866] focus:border-[#002866] focus:outline-none text-black transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block font-semibold text-gray-800">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002866] focus:border-[#002866] focus:outline-none text-black transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#002866] text-white py-3 rounded-lg hover:bg-[#001c4d] transition duration-300 flex items-center justify-center font-medium text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </motion.form>
      </motion.div>
    </div>
  )
}
