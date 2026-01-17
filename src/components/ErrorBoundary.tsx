import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: '#0a0a0a',
          color: '#ffffff',
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#ff6b6b' }}>
            出错了
          </h1>
          <p style={{ fontSize: '16px', marginBottom: '24px', maxWidth: '600px', textAlign: 'center' }}>
            应用程序遇到了一个意外错误。请刷新页面或尝试重新打开。
          </p>
          {this.state.error && (
            <details
              style={{
                marginBottom: '24px',
                padding: '16px',
                background: '#1e1e1e',
                borderRadius: '8px',
                maxWidth: '800px',
                fontSize: '14px',
              }}>
              <summary
                style={{
                  cursor: 'pointer',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}>
                错误详情
              </summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  margin: 0,
                }}>
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#3A86FF',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2b6ecf';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3A86FF';
            }}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
