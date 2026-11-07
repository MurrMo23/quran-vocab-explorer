import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/error-reporting';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** App-wide render error boundary: reports the error and shows a friendly reload card. */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    reportError(error, { fatal: true, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div role="alert" className="w-full max-w-md rounded-xl border bg-card p-6 text-center text-card-foreground shadow-sm">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            This page hit an unexpected problem. Your saved progress is safe. Reloading usually fixes it.
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
