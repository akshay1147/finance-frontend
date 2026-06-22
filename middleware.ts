import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { financeGuard, SESSION_COOKIE, ROLE_COOKIE } from "@/middleware/finance_guard";

export function middleware(request: NextRequest) {
  const guardResponse = financeGuard(request);

  if (guardResponse) {
    return guardResponse;
  }

  const response = NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    response.cookies.set(SESSION_COOKIE, `sess_${Date.now()}`, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }

  if (!request.cookies.get(ROLE_COOKIE)?.value) {
    response.cookies.set(ROLE_COOKIE, "Super Admin", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/invoices/:path*", "/payments/:path*"],
};
