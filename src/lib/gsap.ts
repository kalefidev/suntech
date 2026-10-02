import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { flags } from "./env";

// No chunk inicial só entram o núcleo e o ScrollTrigger. SplitText,
// CustomEase e DrawSVG carregam sob demanda em `lib/split.ts`.
gsap.registerPlugin(ScrollTrigger);

// Teste: `?slowmo=10` desacelera as timelines (a abertura, por exemplo).
if (flags.slowmo > 1) gsap.globalTimeline.timeScale(1 / flags.slowmo);

// A barra de endereço do celular muda a altura da janela ao rolar; sem isto,
// cada mudança dispara um refresh e os pins pulam.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
