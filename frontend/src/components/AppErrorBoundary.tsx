import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearAll } from '../utils/storage';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
    };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Erro inesperado na interface.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro de renderizacao:', error, errorInfo);
  }

  handleReset = () => {
    clearAll();
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-red-700 mb-2">Falha ao renderizar o cardapio</h1>
            <p className="text-sm text-gray-700 mb-3">
              A interface encontrou um erro de JavaScript. Tente limpar o cache e atualizar. Se persistir, copie a mensagem abaixo.
            </p>
            <pre className="text-xs bg-red-50 border border-red-100 rounded p-3 overflow-auto text-red-700 mb-4">
{this.state.message}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition"
              >
                Limpar cache e recarregar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded bg-gray-400 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500 transition"
              >
                Apenas recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
