import { Component, type ErrorInfo, type ReactNode } from 'react';
import { DunetaHttpErrorView } from './DunetaHttpErrorView.js';

export type DunetaAsyncBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
};

type DunetaAsyncBoundaryState = {
  error: unknown;
};

export class DunetaAsyncBoundary extends Component<DunetaAsyncBoundaryProps, DunetaAsyncBoundaryState> {
  state: DunetaAsyncBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[DunetaAsyncBoundary]', error, info);
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <DunetaHttpErrorView error={this.state.error} onRetry={this.reset} />
        )
      );
    }

    return this.props.children;
  }
}
