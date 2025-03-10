import { PrismaClient } from "@prisma/client";



import { error } from "console";
import pkg from 'lodash';
import { NEVER } from "zod";
const { forEach } = pkg;
const prisma = new PrismaClient(); 
enum type {
    BALKANCAR,
    BOSS,
    CAMION 

}

const vehicule_type :type = type.

async function createNiveau() {
    await prisma.niveau.deleteMany()
  await prisma.niveau.create({
   data :{
     code_niveau: 100,
     designation: "Direction Générale",
     type_hierachie : "dg"
   },
   
})
     await prisma.niveau.createMany(
       {
            data: [
            {
                code_niveau: 400,
                designation: "Branche commercialisation",
                type_hierachie: "branche",
                parent_id: 100
            },
            {
                code_niveau: 500,
                designation: "Branche carburant",
                type_hierachie: "Branche",
                parent_id: 100
            },
            {
                code_niveau: 600,
                designation: "Branche GPL",
                type_hierachie: "branche",
                parent_id: 100
            }
            
        ]

       }
    )
}
async function afficher() {
    const niveaux = await prisma.niveau.findMany(
        {
           where: {
                parent_id : 100
            }
        }

    );
    console.log(niveaux);
}

await  createNiveau().catch((error) => {
    console.log(error);
})
