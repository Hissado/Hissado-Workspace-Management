import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Custom fallback UI. If omitted a default error card is shown. */
  fallback?: ReactNode;
  /** Called when an error is caught — useful for error reporting (e.g. Sentry). */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary that catches uncaught runtime errors in its subtree
 * and renders a fallback UI instead of crashing the whole application.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Note: Error boundaries do NOT catch errors in:
 *   - Event handlers (use try/catch there)
 *   - Async code (useEffect + async functions)
 *   - Server-side rendering
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          padding: "32px",
          textAlign: "center",
          color: "#4A5268",
        }}
      >
        <div
          style={{
            fontSize: "40px",
            marginBottom: "16px",
            lineHeight: 1,
          }}
        >
          ⚠
        </div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#070D1A",
            margin: "0 0 8px",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "#9BA3B5",
            maxWidth: "360px",
            lineHeight: 1.6,
            margin: "0 0 20px",
          }}
        >
          An unexpected error occurred in this section. The rest of the app is
          unaffected.
        </p>
        <button
          onClick={this.handleReset}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg,#C9A96E,#A8762E)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
