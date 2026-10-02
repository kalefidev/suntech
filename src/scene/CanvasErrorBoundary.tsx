import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Se o WebGL falhar (contexto não criado, navegador sem suporte), troca a cena
 * pelo fallback em CSS e SVG. O conteúdo continua navegável (seção 5 do brief).
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Aviso, não erro: o fallback é um caminho previsto, e o `snap` trata
    // qualquer `console.error` como falha.
    console.warn("Cena 3D indisponível, usando o fallback:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
