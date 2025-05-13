"use client"
import { usePathname, useRouter } from "next/navigation"
import { Home, Users, Car, FileText, LogOut } from "lucide-react"
import naftal_logo from "../lib/Logo_NAFTAL.svg"
import { useState } from "react"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const navigateTo: (path: string) => void = (path: string) => {
    router.push(path)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        router.push("/login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      path: "/dashboard",
      label: "Tableau de bord",
      icon: <Home size={20} />,
    },
    {
      path: "/Utilisateurs",
      label: "Utilisateurs",
      icon: <Users size={20} />,
    },
    {
      path: "/vehicule",
      label: "Véhicules",
      icon: <Car size={20} />,
    },
    {
      path: "/documents",
      label: "Documents",
      icon: <FileText size={20} />,
    },
  ]

  return (
<div className="fixed print:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10 print:hidden">
      {/*logo*/}
      <div className="flex items-center justify-center h-[12vh] border-b border-gray-200 text-white">
        <img src={naftal_logo.src || "/placeholder.svg"} alt="Naftal Logo" className="h-16 w-auto" />
      </div>

      <nav className="flex flex-col h-[calc(100%-4rem)]">
        <div className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`w-full flex items-center px-4 py-3 transition-colors duration-200 ${
                isActive(item.path)
                  ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`${isActive(item.path) ? "text-indigo-600" : "text-gray-500"}`}>{item.icon}</span>
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 py-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut size={20} className="text-gray-500" />
            <span className="ml-3">{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
