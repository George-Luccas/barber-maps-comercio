"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-zinc-900 border border-red-500/30 rounded-[2rem] m-4">
          <h2 className="text-xl font-bold text-red-500 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-zinc-400 text-sm mb-4">Ocorreu um erro ao carregar este componente.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
