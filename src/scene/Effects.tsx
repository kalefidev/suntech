import { type ReactElement, useSyncExternalStore } from "react";
import { Bloom, EffectComposer, Noise, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { quality } from "./quality";

/**
 * Pós-processamento por tier (docs/fase-0.md, item 7): Bloom no que emite luz
 * (o sol, o LED, os pulsos de energia e os fótons) e grão de filme leve. A
 * vinheta saiu na autocrítica da Fase 7 (o efeito que menos contribuía).
 *
 * O composer fica montado em todos os tiers (no baixo, só com o tone
 * mapping): ele troca o tone mapping do renderer para `NoToneMapping`, e
 * trocar isso depois do aquecimento recompilaria todos os materiais. O tone
 * mapping Neutral de antes (SceneCanvas) vira o último efeito sobre a cena; o
 * Bloom trabalha antes dele, ainda em HDR.
 */
export function Effects() {
  const { post, tier } = useSyncExternalStore(quality.subscribe, quality.get);
  const effects: ReactElement[] = [];
  if (post.bloom) effects.push(<Bloom key="bloom" mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.12} intensity={0.55} radius={0.68} />);
  effects.push(<ToneMapping key="tone" mode={ToneMappingMode.NEUTRAL} />);
  if (post.noise) effects.push(<Noise key="noise" premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.3} />);
  return (
    <EffectComposer multisampling={tier === "baixo" ? 0 : 4} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}
