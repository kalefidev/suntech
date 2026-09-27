import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Se o WebGL falhar ao criar o contexto (ou o navegador não suportar),
 * troca a cena 3D pelo fallback em CSS/SVG — o conteúdo continua 100%
 * navegável (seção 5 do brief).
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Falha ao iniciar a cena 3D, usando fallback:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
