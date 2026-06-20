"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error_message: string;
  error_code: string;
  trace_id: string;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error_message: "",
    error_code: "",
    trace_id: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate a random trace ID for auditability
    const traceId = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      hasError: true,
      error_message: error.message || "An unexpected rendering error occurred",
      error_code: "VISUALIZATION_CRASH",
      trace_id: traceId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught in AnalyticsErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error_message: "",
      error_code: "",
      trace_id: ""
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 border border-rose-500/20 rounded-2xl p-6 flex flex-col justify-between items-center text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              {this.props.fallbackTitle || "Analytics Engine Failure"}
            </h3>
            <p className="text-xs text-slate-400">
              The chart component encountered a visual state parsing anomaly and failed to render.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 w-full text-left font-mono text-[10px] space-y-2 text-slate-400">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Error Code:</span>
              <span className="text-rose-450 font-semibold">{this.state.error_code}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Trace ID:</span>
              <span className="text-blue-400 font-semibold">{this.state.trace_id}</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 block mb-0.5">Error Message:</span>
              <span className="text-slate-300 break-words block leading-normal">
                {this.state.error_message}
              </span>
            </div>
          </div>

          <button
            onClick={this.handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Viewport</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
