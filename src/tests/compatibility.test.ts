import { analyticsTransformer } from "@/services/analytics_transformer";
import { queryClient } from "@/services/query_client";
import { endpointRegistry } from "@/services/endpoint_registry";
import { AnalyticsPayload } from "@/types/analytics";

describe("Backward Compatibility Tests", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("should transform old v1 analytics payload to new contract schema", () => {
    const oldPayload = {
      monthly_revenue: 168000,
      active_users: 1250,
      expense_list: [
        { type: "Engineering", val: 24500 }
      ]
    };

    const transformed = analyticsTransformer.transform(oldPayload as any);

    expect(transformed).toBeDefined();
    expect(transformed.mrr).toBe(168000);
    expect(transformed.departmentUsage[0].department).toBe("Engineering");
    expect(transformed.departmentUsage[0].amount).toBe(24500);
  });

  it("should fallback gracefully if endpoint is deprecated", () => {
    const url = endpointRegistry.resolve("analytics");
    expect(url).toContain("/api/v1/finance/analytics");
  });
});
