import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Structure } from '@/app/interfaces';
const prisma = new PrismaClient();
import { ajouterStructure } from '@/app/prisma';
export async function POST(req: NextRequest) {
  const Struct :Structure = await req.json();
  console.log('Struct', Struct);
  
    try {
        const { code_structure, designation, type_structure_hierachique } = Struct;
       
        const structureExists = await prisma.structure.findUnique({
        where: { code_structure },
        });
        if (structureExists) {
        return NextResponse.json(
            { error: 'Code structure déjà existant' },
            { status: 400 }
        );
        }
        await ajouterStructure(Struct);
        return NextResponse.json({ message: 'Structure ajoutée avec succès' }, { status: 200 });
    } catch (error) {
        console.error('Error in POST /api/structure/ajouterStructure', error);
        return NextResponse.json(
        { error: 'Erreur interne de serveur' },
        { status: 500 }
        );
    }
}
export async function GET() {
    try {
        const structures = await prisma.structure.findMany();
        return NextResponse.json(structures);
    } catch (error) {
        console.error('Error in GET /api/structure/ajouterStructure', error);
        return NextResponse.json(
        { error: 'Erreur interne de serveur' },
        { status: 500 }
        );
    }
}
export async function PUT(req: NextRequest) {
  try {
    const { code_structure, nouvelleDesignation } = await req.json()

    if (!code_structure || !nouvelleDesignation) {
      return NextResponse.json(
        { error: "Le code de structure et la nouvelle désignation sont requis" },
        { status: 400 },
      )
    }

    // Check if structure exists
    const structureExists = await prisma.structure.findUnique({
      where: { code_structure },
    })

    if (!structureExists) {
      return NextResponse.json({ error: "Structure non trouvée" }, { status: 404 })
    }

    // Update only the designation
    const updatedStructure = await prisma.structure.update({
      where: { code_structure },
      data: { designation: nouvelleDesignation },
    })

    return NextResponse.json(
      { message: "Structure modifiée avec succès", structure: updatedStructure },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in PUT /api/structure/modifierStructure", error)
    return NextResponse.json({ error: "Erreur interne de serveur" }, { status: 500 })
  }
}