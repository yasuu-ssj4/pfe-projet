import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

// Update the GET method to filter by gamme.unite_mesure if provided
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const codeType = searchParams.get("code_type")
  const uniteMesure = searchParams.get("unite_mesure")

  try {
    if (codeType) {
      // Fetch programme for a specific type
      const whereClause: any = {
        code_type: Number.parseInt(codeType),
      }

      if (uniteMesure) {
        whereClause.gamme = {
          unite_mesure: uniteMesure,
        }
      }

      const programme = await prisma.programme_entretien.findMany({
        where: whereClause,
        include: {
          gamme: true,
          operation: true,
          type: true,
        },
      })

      return NextResponse.json(programme)
    } else {
      // Fetch all programmes
      const whereClause: any = {}

      if (uniteMesure) {
        whereClause.gamme = {
          unite_mesure: uniteMesure,
        }
      }

      const programmes = await prisma.programme_entretien.findMany({
        where: whereClause,
        include: {
          gamme: true,
          operation: true,
          type: true,
        },
      })

      return NextResponse.json(programmes)
    }
  } catch (error) {
    console.error("Error fetching programmes:", error)
    return NextResponse.json({ error: "Failed to fetch programmes" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Update the POST method to ensure we're using the correct unite_mesure
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code_gamme, code_operation, code_type, periode } = body

    // Create a new programme
    const newProgramme = await prisma.programme_entretien.create({
      data: {
        code_gamme,
        code_operation,
        code_type: Number.parseInt(code_type),
        periode,
      },
    })

    return NextResponse.json(newProgramme, { status: 201 })
  } catch (error) {
    console.error("Error creating programme:", error)
    return NextResponse.json({ error: "Failed to create programme" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
