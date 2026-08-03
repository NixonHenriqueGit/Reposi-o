import React, { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initImageCacheFromIDB } from './utils/indexedDbCache.ts';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[SSTR ErrorBoundary] Erro capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
            <h1 className="text-xl font-bold text-red-400 mb-2">Erro ao carregar a aplicação</h1>
            <p className="text-slate-300 text-sm mb-6">
              Ocorreu um problema ao inicializar o sistema no seu navegador.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-400 text-left overflow-auto max-h-32 mb-6 border border-slate-800">
              {this.state.error?.message || "Erro desconhecido"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root')!;
let mounted = false;

function mountApp() {
  if (mounted) return;
  mounted = true;
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

// Attempt to pre-warm IDB cache, but guarantee app mounting regardless of outcome or timeout
initImageCacheFromIDB()
  .then(() => {
    mountApp();
  })
  .catch((err) => {
    console.warn("[SSTR] Erro ao carregar IDB, iniciando aplicação normalmente:", err);
    mountApp();
  });

// Fallback safety timeout in case IDB promise hangs indefinitely
setTimeout(() => {
  if (!mounted) {
    console.warn("[SSTR] Mount fallback disparado por tempo de resposta do IDB.");
    mountApp();
  }
}, 1000);

