import { NextResponse } from "next/server";
import { analyticsService } from "@/services/analytics_service";
import { ApiResponse } from "@/types/api_response";
import { AnalyticsPayload } from "@/types/analytics";

export async function GET() {
  try {
    const data: AnalyticsPayload = analyticsService.getAnalyticsPayload();

    const response: ApiResponse<AnalyticsPayload> = {
      success: true,
      message: "Financial analytics data retrieved successfully",
      data
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: "Failed to retrieve analytics data",
      errors: [{ code: "INTERNAL_ERROR", message: error.message || "Unknown error occurred" }]
    };
    return NextResponse.json(response, { status: 500 });
  }
}
