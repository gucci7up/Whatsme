import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
                    <div className="max-w-2xl w-full space-y-4">
                        <h1 className="text-3xl font-bold text-red-500">¡Algo salió mal! (Error Fatal)</h1>
                        <p className="text-gray-300">Por favor, envía una captura de este error al desarrollador:</p>

                        <div className="bg-black p-4 rounded-lg border border-gray-700 overflow-auto max-h-[600px]">
                            <h2 className="text-xl font-mono text-yellow-400 mb-2">{this.state.error && this.state.error.toString()}</h2>
                            <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
                        >
                            Intentar Recargar
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
