import { type ReactElement, useSyncExternalStore } from "react";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { quality } from "./quality";

/**
 * Pós-processamento por tier (docs/v3-fase-0.md, §4): Bloom só no que emite luz (o LED e
 * o fluxo de energia: o limiar passa dos reflexos do ambiente) e o tone mapping Neutral
 * por último. O grão da v2 saiu do composer: o canvas é transparente, e o grão vira um
 * tile CSS fixo (o `Noise` não cobre o fundo).
 *
 * O composer fica montado em todos os tiers (no baixo, só com o tone mapping): ele troca
 * o tone mapping do renderer para `NoToneMapping`, e trocar isso depois do aquecimento
 * recompilaria todos os materiais. O `alpha: true` do contexto passa para o composer.
 */
export function Effects() {
  const { post, tier } = useSyncExternalStore(quality.subscribe, quality.get);
  const effects: ReactElement[] = [];
  if (post.bloom) effects.push(<Bloom key="bloom" mipmapBlur luminanceThreshold={1.6} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />);
  effects.push(<ToneMapping key="tone" mode={ToneMappingMode.NEUTRAL} />);
  return (
    <EffectComposer multisampling={tier === "baixo" ? 0 : 4} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}
