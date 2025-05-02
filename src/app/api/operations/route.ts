import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all operations
    const operations = await prisma.operation.findMany()
    return NextResponse.json(operations)
  } catch (error) {
    console.error("Error fetching operations:", error)
    return NextResponse.json({ error: "Failed to fetch operations" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code_operation, designation } = body

    // Create a new operation
    const newOperation = await prisma.operation.create({
      data: {
        code_operation,
        designation,
      },
    })

    return NextResponse.json(newOperation, { status: 201 })
  } catch (error) {
    console.error("Error creating operation:", error)
    return NextResponse.json({ error: "Failed to create operation" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
