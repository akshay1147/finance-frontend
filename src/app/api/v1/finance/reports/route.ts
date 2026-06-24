import { NextResponse } from "next/server";
import { reportService } from "@/services/report_service";
import { ApiResponse } from "@/types/api_response";

export async function GET() {
  try {
    const data = reportService.getReportsAggregates();

    const response: ApiResponse = {
      success: true,
      message: "Reports aggregates retrieved successfully",
      data
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: "Failed to compile reports aggregate data",
      errors: [{ code: "INTERNAL_ERROR", message: error.message || "Unknown error occurred" }]
    };
    return NextResponse.json(response, { status: 500 });
  }
}
