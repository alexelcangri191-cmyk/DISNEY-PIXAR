import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
          style={{ background: '#000000' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,193,7,0.1)',
              border: '1px solid rgba(255,193,7,0.3)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFC107"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="text-center">
            <h2
              className="font-black text-lg mb-2"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Algo salió mal
            </h2>
            <p className="text-sm" style={{ color: '#888888' }}>
              Ocurrió un error inesperado al cargar esta sección.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)',
              color: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.6)',
              boxShadow: '0 0 20px rgba(255,193,7,0.4)',
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
