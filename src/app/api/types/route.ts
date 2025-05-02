import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all types with their associated marque (brand)
    const types = await prisma.type.findMany({
      include: {
        FK_type_REF_marque: true,
        progammes_entretien: true,
      },
    })

    return NextResponse.json(types)
  } catch (error) {
    console.error("Error fetching types:", error)
    return NextResponse.json({ error: "Failed to fetch types" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
