import { SECRET_KEY } from "../prisma";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';
export async function createSession(user: { username: string; password: string }) {
        // const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24 hours
        const expiresAt = new Date(Date.now() + 10 * 1000); // 10 seconds for testing
      
        const sessionData = {
          username: user.username,
          password: user.password,
          expiresAt: expiresAt.toISOString(),
        };
      
        const sessionToken = jwt.sign(sessionData, SECRET_KEY, { expiresIn: "10s" });
      
        (await cookies()).set("session", sessionToken, {
          httpOnly: true,
          secure: true,
          expires: expiresAt, 
        });
      }
      

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if(!session) return;
    return await decrypt(session);
   }
  
 
  const key = new TextEncoder().encode(SECRET_KEY);
  export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input,key, {
      algorithms: ["HS256"],
    });
    return payload;
  }
  
  export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if(!session) return;
  
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date() + 10 * 1000);
    const res = NextResponse.next();
    const newSessionToken = jwt.sign(parsed, SECRET_KEY, { expiresIn: '10s'});
    res.cookies.set({
      name: 'session',
      value: newSessionToken,
      httpOnly: true,
      expires: parsed.expires,
    });
    return res;
  }
  
  export async function logout() {
    (await cookies()).set('session', '', { expires: new Date(0) });
  }
  