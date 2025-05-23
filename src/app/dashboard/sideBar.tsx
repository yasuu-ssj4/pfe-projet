"use client"
import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  Users,
  Car,
  FileText,
  MonitorCogIcon,
  LogOut,
  ChevronDown,
  BarChart2,
  FileBarChart,
  Warehouse,
  Truck,
  Forklift,
  Building2,
  Files} from "lucide-react"
import naftal_logo from "../lib/Logo_NAFTAL.svg"
import { useState } from "react"
import path from "path"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const isActive = (path: string) => {
    return pathname === path
  }

  const navigateTo: (path: string) => void = (path: string) => {
    router.push(path)
  }

  const toggleExpand = (itemPath: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemPath) ? prev.filter((item) => item !== itemPath) : [...prev, itemPath],
    )
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
      path: "/vehicule",
      label: "Véhicules",
      icon: <Car size={20} />,
    },
    {
      path: "/listeDI",
      label: "Liste des DI",
      icon: <Files size={20} />,
    },
    {
      path: "/listeRi",
      label: "Liste des RI",
      icon: <Files size={20} />,
    },
    {
      path: "/rapport",
      label: "Rapport",
      icon: <FileText size={20} />,
      subItems: [
        {
          path: "/documents/immobilisation",
          label: "Situation IMB",
          icon: <BarChart2 size={18} />,
        },
        {
          path: "/Rapport_activites",
          label: "Rapport Activite",
          icon: <FileBarChart size={18} />, 
        },
      ],
    },
    {
      path: "/parametrage",
      label: "Parametrage",
      icon: <MonitorCogIcon size={20} />,
      subItems: [
        {
          path: "/Utilisateurs",
          label: "Utilisateurs",
          icon: <Users size={18} />,
        },
        {
          path: "/structure",
          label: "Structures",
          icon: <Building2 size={18} />,
        },
        {
          path: "/marque",
          label: "Marque",
          icon: <Truck size={18} />,
        },
        {
          path: "/type",
          label: "Type",
          icon: <Car size={18} />,
        },
        {
          path: "/documents/entretien",
          label: "Prog.entretien",
          icon: <Forklift size={18} />,
        },
      ]
    },
  ]

  return (
    <div className="fixed print:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10 print:hidden">
      {/*logo*/}
      <div className="flex items-center justify-center h-[12vh] border-b border-gray-200 text-white">
        <img src={naftal_logo.src || "/placeholder.svg"} alt="Naftal Logo" className="h-16 w-auto" />
      </div>

      <nav className="flex flex-col h-[calc(100%-4rem)]">
        <div className="flex-1 ">
          {menuItems.map((item) => (
            <div key={item.path}>
              <button
                onClick={() => (item.subItems ? toggleExpand(item.path) : navigateTo(item.path))}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <span className={`${isActive(item.path) 
                    ? "text-indigo-600" 
                    : "text-gray-500"}`}>{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${expandedItems.includes(item.path) ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {item.subItems && expandedItems.includes(item.path) && (
                <div className="ml-6 border-l border-gray-200 pl-4">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={() => navigateTo(subItem.path)}
                      className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                        isActive(subItem.path) 
                        ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 font-medium" 
                        : "text-gray-600 hover:text-indigo-500"
                      }`}
                    >
                      <span className={`${isActive(subItem.path) ? "text-indigo-600" : "text-gray-500"}`}>
                        {subItem.icon}
                      </span>
                      <span className="ml-3">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
