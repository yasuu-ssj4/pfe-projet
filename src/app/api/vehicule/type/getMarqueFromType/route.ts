import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { code_type } = await req.json()

    if (!code_type) {
      return NextResponse.json({ error: "Le code du type est requis" }, { status: 400 })
    }

    const type = await prisma.type.findUnique({
      where: { id_type: Number(code_type) },
      select: { id_marque: true },
    })

    if (!type) {
      return NextResponse.json({ error: "Type non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ id_marque: type.id_marque }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/vehicule/type/getMarqueFromType:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
