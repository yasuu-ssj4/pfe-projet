import type { ReactNode } from "react";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
