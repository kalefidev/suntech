import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { flags } from "./env";

// No chunk inicial só entram o núcleo e o ScrollTrigger. SplitText,
// CustomEase e DrawSVG carregam sob demanda em `lib/split.ts`.
gsap.registerPlugin(ScrollTrigger);

// Testes: `?slowmo=10` desacelera as timelines (para fotografar a abertura).
// Com `?snap`, as animações por tempo (abertura, revelações e contadores)
// andam 3× mais rápido, para a foto pegar o estado final; o que anda com o
// scroll não muda.
const speed = flags.slowmo > 1 ? 1 / flags.slowmo : flags.snap ? 3 : 1;
if (speed !== 1) gsap.globalTimeline.timeScale(speed);

// A barra de endereço do celular muda a altura da janela ao rolar; sem isto,
// cada mudança dispara um refresh e os pins pulam.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
