import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uniteMesure = searchParams.get("unite_mesure")

  try {
    // Fetch gammes with optional filtering by unite_mesure
    const whereClause = uniteMesure ? { unite_mesure: uniteMesure } : {}

    const gammes = await prisma.gamme.findMany({
      where: whereClause,
      orderBy: {
        designation: "asc",
      },
    })

    return NextResponse.json(gammes)
  } catch (error) {
    console.error("Error fetching gammes:", error)
    return NextResponse.json({ error: "Failed to fetch gammes" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code_gamme, designation, unite_mesure } = body

    // Create a new gamme
    const newGamme = await prisma.gamme.create({
      data: {
        code_gamme,
        designation,
        unite_mesure: unite_mesure || "kilometrage", // Default to kilometrage if not provided
      },
    })

    return NextResponse.json(newGamme, { status: 201 })
  } catch (error) {
    console.error("Error creating gamme:", error)
    return NextResponse.json({ error: "Failed to create gamme" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
