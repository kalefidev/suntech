import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// No chunk inicial só entram o núcleo e o ScrollTrigger. SplitText,
// CustomEase e DrawSVG carregam sob demanda em `lib/split.ts`.
gsap.registerPlugin(ScrollTrigger);

// A barra de endereço do celular muda a altura da janela ao rolar; sem isto,
// cada mudança dispara um refresh e os pins pulam.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
