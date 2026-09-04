import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TRACE Intel Module Crash caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <div className="card-3d max-w-lg w-full p-6 rounded-2xl border border-red-500/30 bg-surface/95 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                {this.props.fallbackTitle || 'Intelligence View Diagnostic Intercept'}
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                An anomaly occurred while compiling graph telemetry. The system prevented an application crash.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/60 border border-red-500/20 text-left overflow-x-auto">
                <code className="text-[11px] font-mono text-red-400 block whitespace-pre-wrap">
                  {this.state.error.message || String(this.state.error)}
                </code>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold inline-flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Module State</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
