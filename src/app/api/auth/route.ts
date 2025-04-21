import { PrismaClient } from "@prisma/client";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { SECRET_KEY } from "../../prisma"; 
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.utilisateur.findUnique({
      where: { username },
      select: {
        mot_de_passe: true,
        methode_authent: true,
        id_utilisateur: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    if (user.methode_authent === "BDD") {
      const decryptedMdp = CryptoJS.AES.decrypt(user.mot_de_passe, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      if (decryptedMdp !== password) {
        return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
      }

  
      const token = jwt.sign(
        {
          id_utilisateur: user.id_utilisateur,
        },
        SECRET_KEY,
        { expiresIn: "12h" }
      );

      
      (await
          
            cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 43200, 
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Méthode non supportée" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
