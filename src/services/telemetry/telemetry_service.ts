export class TelemetryService {
  public trackApiFailure(endpoint: string, status: number, error: any) {
    console.error(`[TELEMETRY: API FAILURE] Endpoint: ${endpoint} | Status: ${status}`, error);
    // In a real system, send this to Datadog/NewRelic/Sentry
  }

  public trackRenderFailure(componentName: string, error: any) {
    console.error(`[TELEMETRY: RENDER FAILURE] Component: ${componentName}`, error);
    // In a real system, send this to Datadog/NewRelic/Sentry
  }

  public trackDashboardPerformance(metricName: string, durationMs: number) {
    console.log(`[TELEMETRY: PERFORMANCE] ${metricName} took ${durationMs.toFixed(2)}ms`);
    // In a real system, track standard web vitals and custom timing events
  }
}

export const telemetryService = new TelemetryService();
