import type { ReactNode } from "react"
import Sidebar from "./dashboard/sideBar"
import "./globals.css"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 ml-64">{children}</div>
        </div>
      </body>
    </html>
  )
}
