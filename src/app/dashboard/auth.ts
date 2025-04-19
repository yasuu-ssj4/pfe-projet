// utils/auth.ts (or any shared file)
import jwt from "jsonwebtoken";
import { cookies } from "next/dist/server/request/cookies";
import { SECRET_KEY } from "@/app/prisma";

export async function getUserFromToken() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id_utilisateur: number;
    };
    return decoded; 
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

