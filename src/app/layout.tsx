import type { ReactNode } from "react"
import Sidebar from "./dashboard/sideBar"
import "./globals.css"
import ClientLayout from "./ClientLayout"
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen bg-gray-50">
        <ClientLayout></ClientLayout>
          <div className="flex-1 ml-64">{children}</div>
        </div>
      </body>
    </html>
  )
}
