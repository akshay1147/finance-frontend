import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const FINANCE_ROUTES = ["/dashboard", "/invoices", "/payments"];
const SESSION_COOKIE = "lti_finance_session";
const ROLE_COOKIE = "lti_finance_role";

const ROUTE_PERMISSIONS: Record<string, { module: string; action: string }> = {
  "/dashboard": { module: "invoices", action: "read" },
  "/invoices": { module: "invoices", action: "read" },
  "/payments": { module: "payments", action: "read" },
};

const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  "Super Admin": {
    invoices: ["read", "create", "update", "cancel", "send", "credit-note"],
    payments: ["read", "record", "refund", "reconcile"],
    reports: ["read", "export"],
  },
  "Finance Manager": {
    invoices: ["read", "create", "update", "cancel", "send", "credit-note"],
    payments: ["read", "record", "refund", "reconcile"],
    reports: ["read", "export"],
  },
  Accountant: {
    invoices: ["read", "create", "update", "send"],
    payments: ["read", "record"],
    reports: ["read"],
  },
  "Billing Staff": {
    invoices: ["read", "create", "send"],
    payments: ["read", "record"],
    reports: [],
  },
  Auditor: {
    invoices: ["read"],
    payments: ["read"],
    reports: ["read"],
  },
};

function hasPermission(role: string, module: string, action: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms[module]?.includes(action) ?? false;
}

function isFinanceRoute(pathname: string): boolean {
  return FINANCE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function financeGuard(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (!isFinanceRoute(pathname)) {
    return null;
  }

  const role = request.cookies.get(ROLE_COOKIE)?.value ?? "Super Admin";

  const required = ROUTE_PERMISSIONS[pathname];
  if (required && !hasPermission(role, required.module, required.action)) {
    const deniedUrl = new URL("/", request.url);
    deniedUrl.searchParams.set("reason", "insufficient_permissions");
    return NextResponse.redirect(deniedUrl);
  }

  return null;
}

export { SESSION_COOKIE, ROLE_COOKIE, FINANCE_ROUTES, ROUTE_PERMISSIONS };
