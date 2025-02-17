import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    
    const newUser = await prisma.userTest.create({
      data: { Username: username },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
export async function GET() {
    try {
      const users = await prisma.userTest.findMany();
      return NextResponse.json(users);
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
  }
  