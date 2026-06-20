export const ENDPOINTS = {
  v1: {
    analytics: "/finance/analytics",
    reports: "/finance/reports",
    expenses: "/finance/expenses",
    subscriptions: "/finance/subscriptions",
  }
} as const;

export function getEndpoint(version: keyof typeof ENDPOINTS, route: keyof typeof ENDPOINTS['v1']): string {
  return ENDPOINTS[version][route];
}
