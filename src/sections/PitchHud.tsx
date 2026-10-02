import { useSyncExternalStore } from "react";
import { copy } from "../content/copy";
import { PITCH_SECONDS } from "../content/feira";
import { pitchProgress, pitchStore, stopPitch, togglePitch } from "../lib/pitch";

const t = copy.pitch;

/** m:ss (o relógio do pitch). */
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * HUD do modo pitch (docs/fase-0.md, item 4): fixo embaixo, em Grafite,
 * legível a 3 m na TV do estande. Mostra o relógio, o setor que está falando e
 * a parada, com a barra de progresso (escrita pelo relógio, sem re-render). A
 * região `aria-live` existe sempre, para anunciar cada parada.
 */
export function PitchHud() {
  const state = useSyncExternalStore(pitchStore.subscribe, pitchStore.get, pitchStore.get);
  const { running, paused, second, stop } = state;

  return (
    <>
      <p className="sr-only pitch-live" aria-live="polite">
        {running && stop ? `${stop.sector}: ${stop.label}` : ""}
      </p>
      {running && (
        <div className="pitch-hud" role="region" aria-label={t.hudLabel}>
          <p className="pitch-hud__clock num">
            <span>{clock(second)}</span>
            <span className="pitch-hud__total"> / {clock(PITCH_SECONDS)}</span>
          </p>
          <p className="pitch-hud__now">
            <span className="pitch-hud__label">{t.speaking}</span>
            <span className="pitch-hud__sector">{stop?.sector}</span>
            <span className="pitch-hud__stop">{stop?.label}</span>
          </p>
          <div className="pitch-hud__track" aria-hidden="true">
            <span
              ref={(element) => {
                pitchProgress.element = element;
              }}
              className="pitch-hud__bar"
            />
          </div>
          <div className="pitch-hud__actions">
            <button type="button" className="pitch-hud__button" onClick={togglePitch}>
              {paused ? t.resume : t.pause}
            </button>
            <button type="button" className="pitch-hud__button" onClick={stopPitch}>
              {t.exit}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
