import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard"],
};
export function middleware(req: NextRequest) {
  const session = req.cookies.get('session_id');

  const protectedRoutes = ['/dashboard'];

  if (protectedRoutes.includes(req.nextUrl.pathname) && !session) {
    return NextResponse.redirect(new URL('./', req.url));
  }

  return NextResponse.next();
}
/*
select salesman.names , custumer.cust_name , custumer.city
from salesman join custumer
on salesman.city = custumer.city

*/