"use client"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Users,
  Car,
  FileText,
  MonitorIcon as MonitorCogIcon,
  LogOut,
  ChevronDown,
  BarChart2,
  FileBarChart,
  Truck,
  Forklift,
  Building2,
  Files,
} from "lucide-react"
import naftal_logo from "../lib/Logo_NAFTAL.svg"
import { useState, useCallback, useMemo, memo } from "react"

// Memoized menu items to prevent recreation on every render
const MENU_ITEMS = [
  {
    path: "/dashboard",
    label: "Tableau de bord",
    icon: Home,
  },
  {
    path: "/vehicule",
    label: "Véhicules",
    icon: Car,
  },
  {
    path: "/listeDI",
    label: "Liste des DI",
    icon: Files,
  },
  {
    path: "/listeRi",
    label: "Liste des RI",
    icon: Files,
  },
  {
    path: "/rapport",
    label: "Rapport",
    icon: FileText,
    subItems: [
      {
        path: "/documents/immobilisation",
        label: "Situation IMB",
        icon: BarChart2,
      },
      {
        path: "/Rapport_activites",
        label: "Rapport Activite",
        icon: FileBarChart,
      },
    ],
  },
  {
    path: "/parametrage",
    label: "Parametrage",
    icon: MonitorCogIcon,
    subItems: [
      {
        path: "/Utilisateurs",
        label: "Utilisateurs",
        icon: Users,
      },
      {
        path: "/structure",
        label: "Structures",
        icon: Building2,
      },
      {
        path: "/marque",
        label: "Marque",
        icon: Truck,
      },
      {
        path: "/type",
        label: "Type",
        icon: Car,
      },
      {
        path: "/documents/entretien",
        label: "Prog.entretien",
        icon: Forklift,
      },
    ],
  },
] as const

// Memoized SubMenuItem component
const SubMenuItem = memo(
  ({
    subItem,
    isActive,
    onNavigate,
  }: {
    subItem: any
    isActive: boolean
    onNavigate: (path: string) => void
  }) => {
    const IconComponent = subItem.icon

    const handleClick = useCallback(() => {
      onNavigate(subItem.path)
    }, [subItem.path, onNavigate])

    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
          isActive
            ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 font-medium"
            : "text-gray-600 hover:text-indigo-500"
        }`}
      >
        <IconComponent size={18} className={isActive ? "text-indigo-600" : "text-gray-500"} />
        <span className="ml-3">{subItem.label}</span>
      </button>
    )
  },
)

SubMenuItem.displayName = "SubMenuItem"

// Memoized MenuItem component
const MenuItem = memo(
  ({
    item,
    isActive,
    isExpanded,
    onNavigate,
    onToggleExpand,
    pathname,
  }: {
    item: any
    isActive: boolean
    isExpanded: boolean
    onNavigate: (path: string) => void
    onToggleExpand: (path: string) => void
    pathname: string
  }) => {
    const IconComponent = item.icon

    const handleClick = useCallback(() => {
      if (item.subItems) {
        onToggleExpand(item.path)
      } else {
        onNavigate(item.path)
      }
    }, [item.path, item.subItems, onNavigate, onToggleExpand])

    // Memoize sub-items rendering
    const subItemsContent = useMemo(() => {
      if (!item.subItems || !isExpanded) return null

      return (
        <div className="ml-6 border-l border-gray-200 pl-4">
          {item.subItems.map((subItem: any) => (
            <SubMenuItem
              key={subItem.path}
              subItem={subItem}
              isActive={pathname === subItem.path}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )
    }, [item.subItems, isExpanded, pathname, onNavigate])

    return (
      <div>
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
            isActive
              ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <IconComponent size={20} className={isActive ? "text-indigo-600" : "text-gray-500"} />
            <span className="ml-3">{item.label}</span>
          </div>
          {item.subItems && (
            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          )}
        </button>
        {subItemsContent}
      </div>
    )
  },
)

MenuItem.displayName = "MenuItem"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Memoized active path checker
  const isActive = useCallback(
    (path: string) => {
      return pathname === path
    },
    [pathname],
  )

  // Memoized navigation handler
  const navigateTo = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router],
  )

  // Memoized toggle expand handler
  const toggleExpand = useCallback((itemPath: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemPath) ? prev.filter((item) => item !== itemPath) : [...prev, itemPath],
    )
  }, [])

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return // Prevent multiple logout attempts

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
  }, [isLoggingOut, router])

  // Memoized menu items rendering
  const menuItemsContent = useMemo(() => {
    return MENU_ITEMS.map((item) => (
      <MenuItem
        key={item.path}
        item={item}
        isActive={isActive(item.path)}
        isExpanded={expandedItems.includes(item.path)}
        onNavigate={navigateTo}
        onToggleExpand={toggleExpand}
        pathname={pathname}
      />
    ))
  }, [expandedItems, isActive, navigateTo, toggleExpand, pathname])

  return (
    <div className="fixed print:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10 print:hidden">
      {/* Logo */}
      <div className="flex items-center justify-center h-[12vh] border-b border-gray-200 text-white">
        <img src={naftal_logo.src || "/placeholder.svg"} alt="Naftal Logo" className="h-16 w-auto" loading="eager" />
      </div>

      <nav className="flex flex-col h-[calc(100%-4rem)]">
        <div className="flex-1">{menuItemsContent}</div>

        <div className="border-t border-gray-200 py-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={20} className="text-gray-500" />
            <span className="ml-3">{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
