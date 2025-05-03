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