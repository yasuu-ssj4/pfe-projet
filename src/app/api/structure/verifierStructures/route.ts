import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();

    if (!type) {
      return NextResponse.json(
        { error: "body sans type" },
        { status: 400 }
      );
    }

    const validTypes = ["District", "Centre"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `'${type}' n'est pas un type d'hierachie` },
        { status: 400 }
      );
    }

    const structures = await prisma.structure.findMany({
      select: {
        code_structure: true,
        designation: true,
      },
      where: {
        type_structure_hierachique: type
      },
    });

    return NextResponse.json(structures, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/...", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
      // Fetch all operations
      const centres = await prisma.structure.findMany({
        where : { type_structure_hierachique : { in: ["centre", "Centre"] } }
      })
      return NextResponse.json(centres)
    } catch (error) {
      console.error("Error fetching operations:", error)
      return NextResponse.json({ error: "Failed to fetch operations" }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
}