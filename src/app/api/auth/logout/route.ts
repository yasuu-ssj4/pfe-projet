import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // supprimer token
    ;(await cookies()).delete("token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 })
  }
}
