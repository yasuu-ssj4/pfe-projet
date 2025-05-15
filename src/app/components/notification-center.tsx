"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertTriangle, FileText, Clock, Wrench } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type Notification = {
  id: string
  type: "kilometrage" | "document" | "maintenance" | "immobilisation" | "demande"
  title: string
  message: string
  date: Date
  read: boolean
  link?: string
  severity: "info" | "warning" | "critical"
}

export default function NotificationCenter({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()

    // Set up polling for new notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      // Fetch all types of alerts
      const [kilometrageRes, documentRes, maintenanceRes, demandesRes, immobilisationRes] = await Promise.all([
        fetch("/api/alerts/kilometrage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("/api/alerts/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("/api/alerts/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("/api/alerts/demandes-en-instance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("/api/alerts/vehicules-immobilises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
      ])

      // Process kilometrage alerts
      const kilometrageAlerts = await kilometrageRes.json()
      const kilometrageNotifications = kilometrageAlerts.map((alert: any) => ({
        id: `kilometrage-${alert.code_vehicule}`,
        type: "kilometrage" as const,
        title: "Mise à jour kilométrage",
        message: `Le véhicule ${alert.code_vehicule} (${alert.n_immatriculation}) nécessite une mise à jour de kilométrage.`,
        date: new Date(),
        read: false,
        link: "/dashboard?tab=kilometrage",
        severity: alert.jours_depuis_maj > 7 ? "critical" : alert.jours_depuis_maj > 5 ? "warning" : "info",
      }))

      // Process document alerts
      const documentAlerts = await documentRes.json()
      const documentNotifications = documentAlerts.map((alert: any) => ({
        id: `document-${alert.code_vehicule}-${alert.document_type}`,
        type: "document" as const,
        title: "Document à renouveler",
        message: `Le document ${alert.document_type} du véhicule ${alert.code_vehicule} expire dans ${alert.jours_restants} jours.`,
        date: new Date(),
        read: false,
        link: "/dashboard?tab=documents",
        severity: alert.jours_restants <= 3 ? "critical" : alert.jours_restants <= 7 ? "warning" : "info",
      }))

      // Process maintenance alerts
      const maintenanceAlerts = await maintenanceRes.json()
      const maintenanceNotifications = maintenanceAlerts.map((alert: any) => ({
        id: `maintenance-${alert.code_vehicule}-${alert.code_gamme}-${alert.code_operation}`,
        type: "maintenance" as const,
        title: "Maintenance à prévoir",
        message: `Le véhicule ${alert.code_vehicule} nécessite une maintenance "${alert.gamme_designation}" (${alert.valeur_restante} ${alert.unite_mesure} restants).`,
        date: new Date(),
        read: false,
        link: "/dashboard?tab=maintenance",
        severity:
          alert.valeur_restante <= 0 ? "critical" : alert.valeur_restante <= alert.periode * 0.1 ? "warning" : "info",
      }))

      // Process demandes en instance
      const demandesData = await demandesRes.json()
      const demandesNotifications =
        demandesData.count > 0
          ? [
              {
                id: `demandes-${new Date().getTime()}`,
                type: "demande" as const,
                title: "Demandes en instance",
                message: `Il y a ${demandesData.count} demande(s) d'intervention en instance.`,
                date: new Date(),
                read: false,
                link: "/vehicule/intervention/demande",
                severity: demandesData.count > 5 ? "critical" : demandesData.count > 2 ? "warning" : "info",
              },
            ]
          : []

      // Process vehicules immobilisés
      const immobilisationData = await immobilisationRes.json()
      const immobilisationNotifications =
        immobilisationData.count > 0
          ? [
              {
                id: `immobilisation-${new Date().getTime()}`,
                type: "immobilisation" as const,
                title: "Véhicules immobilisés",
                message: `Il y a ${immobilisationData.count} véhicule(s) immobilisé(s).`,
                date: new Date(),
                read: false,
                link: "/vehicule/immobilisation",
                severity: immobilisationData.count > 5 ? "critical" : immobilisationData.count > 2 ? "warning" : "info",
              },
            ]
          : []

      // Combine all notifications
      const allNotifications = [
        ...kilometrageNotifications,
        ...documentNotifications,
        ...maintenanceNotifications,
        ...demandesNotifications,
        ...immobilisationNotifications,
      ]

      // Sort by date (newest first) and severity
      allNotifications.sort((a: Notification, b: Notification) => {
        // First sort by severity
        const severityOrder = { critical: 0, warning: 1, info: 2 }
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
        if (severityDiff !== 0) return severityDiff

        // Then by date
        return b.date.getTime() - a.date.getTime()
      })

      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string, severity: string) => {
    switch (type) {
      case "kilometrage":
        return <Clock className={`h-5 w-5 ${getSeverityColor(severity)}`} />
      case "document":
        return <FileText className={`h-5 w-5 ${getSeverityColor(severity)}`} />
      case "maintenance":
        return <Wrench className={`h-5 w-5 ${getSeverityColor(severity)}`} />
      case "immobilisation":
        return <AlertTriangle className={`h-5 w-5 ${getSeverityColor(severity)}`} />
      case "demande":
        return <AlertTriangle className={`h-5 w-5 ${getSeverityColor(severity)}`} />
      default:
        return <Bell className={`h-5 w-5 ${getSeverityColor(severity)}`} />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500"
      case "warning":
        return "text-orange-500"
      default:
        return "text-blue-500"
    }
  }

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50"
      case "warning":
        return "bg-orange-50"
      default:
        return "bg-blue-50"
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement des notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune notification</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 ${
                    notification.read ? "bg-white" : getSeverityBgColor(notification.severity)
                  } hover:bg-gray-50`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type, notification.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(notification.date, "dd MMM yyyy, HH:mm", { locale: fr })}
                      </p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                          onClick={() => {
                            markAsRead(notification.id)
                            setIsOpen(false)
                          }}
                        >
                          Voir les détails
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
