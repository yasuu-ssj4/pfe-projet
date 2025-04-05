import { PrismaClient } from "@prisma/client";
import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../../prisma";

const prisma = new PrismaClient();  

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const user = await prisma.utilisateur.findUnique({
            where: { username },
            select: { mot_de_passe: true, methode_authent: true , code_structure : true , id_utilisateur : true}
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "Utilisateur non trouvé." }), { status: 404 });
        }

        if (user.methode_authent === "BDD") {
            const decryptedMdp = CryptoJS.AES.decrypt(user.mot_de_passe, SECRET_KEY).toString(CryptoJS.enc.Utf8);
            if (decryptedMdp !== password) {
                return new Response(JSON.stringify({ error: "Mot de passe incorrect." }), { status: 401 });
            }
            return new Response(JSON.stringify({ success: true , id_utilisateur : user.id_utilisateur , code_structure : user.code_structure  }), { status: 200 });
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: "Erreur interne du serveur." }), { status: 500 });
    }
}
