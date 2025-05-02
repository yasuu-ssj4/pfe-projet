import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { code_type: string } }) {
  try {
    const codeType = Number.parseInt(params.code_type)

    // Delete all programmes for this type
    await prisma.programme_entretien.deleteMany({
      where: {
        code_type: codeType,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting programmes:", error)
    return NextResponse.json({ error: "Failed to delete programmes" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: Request, { params }: { params: { code_type: string } }) {
  try {
    const codeType = Number.parseInt(params.code_type)
    const body = await request.json()
    const { code_gamme, code_operation, periode } = body

    // Update the programme
    const updatedProgramme = await prisma.programme_entretien.update({
      where: {
        code_type_code_gamme_code_operation: {
          code_type: codeType,
          code_gamme,
          code_operation,
        },
      },
      data: {
        periode,
      },
    })

    return NextResponse.json(updatedProgramme)
  } catch (error) {
    console.error("Error updating programme:", error)
    return NextResponse.json({ error: "Failed to update programme" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
