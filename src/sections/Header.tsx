import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ScrollTrigger } from "../lib/gsap";
import { getLenis } from "../lib/lenis";
import { getSections, onSectionsChange, scrollToSection } from "../lib/sections";
import { company } from "../content/company";
import { partsOfFair, type PartId } from "../content/feira";

const TOTAL = partsOfFair.length;

/** Vai até a parte e leva o foco para o título dela (teclado e leitor de tela). */
function goTo(id: PartId) {
  if (!scrollToSection(id)) return;
  history.replaceState(null, "", `#${id}`);
  document.getElementById(`${id}-titulo`)?.focus({ preventScroll: true });
}

/** Número da parte de cada seção (`data-part`), lido a cada refresh. */
let partById = new Map<string, number>();

function readParts(): void {
  partById = new Map(
    [...document.querySelectorAll<HTMLElement>("[data-section][data-part]")].map((el) => [
      el.dataset.section ?? "",
      Number(el.dataset.part),
    ]),
  );
}

/** Parte atual (1 a 6) pela posição do meio da tela; 0 antes da Parte 1. */
function partAt(y: number): number {
  const probe = y + window.innerHeight * 0.5;
  let current = 0;
  for (const section of getSections()) {
    if (probe < section.start) break;
    current = partById.get(section.id) ?? current;
  }
  return current;
}

export function Header() {
  const [part, setPart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Parte atual e esconder ao rolar para baixo no celular. Só muda estado
  // quando a parte muda, não a cada quadro.
  useEffect(() => {
    const header = headerRef.current;
    let current = -1;
    const update = (y: number, direction: number) => {
      const next = partAt(y);
      if (next !== current) {
        current = next;
        setPart(next);
      }
      if (header) header.dataset.away = String(direction > 0 && y > 120);
    };
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => update(self.scroll(), self.direction),
    });
    const off = onSectionsChange(() => {
      readParts();
      update(window.scrollY, 0);
    });
    return () => {
      trigger.kill();
      off();
    };
  }, []);

  // Menu do celular: diálogo modal simples (foco preso, Esc fecha, página inerte).
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    const sheet = sheetRef.current;
    const menuButton = menuButtonRef.current;
    sheet?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const focusables = [...sheet.querySelectorAll<HTMLElement>("a, button")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      lenis?.start();
      menuButton?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  const onAnchor = (id: PartId) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMenuOpen(false);
    // Espera o menu fechar (e o Lenis voltar) antes de rolar.
    requestAnimationFrame(() => goTo(id));
  };

  return (
    <header ref={headerRef} className="site-header page-x" data-away="false">
      <a
        href="#hero"
        className="type-label site-header__brand"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("hero");
        }}
      >
        {company.name}
      </a>

      <nav aria-label="Partes da apresentação" className="site-header__nav">
        <ol>
          {partsOfFair.map((p) => (
            <li key={p.id}>
              <a href={`#${p.id}`} aria-current={part === p.n ? "true" : undefined} onClick={onAnchor(p.id)}>
                <span className="num">{p.n}</span> {p.nav}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="site-header__meta">
        <span className="type-caption num site-header__count" aria-hidden="true" data-visible={part > 0}>
          {part > 0 ? `${part} de ${TOTAL}` : ""}
        </span>
        <button
          ref={menuButtonRef}
          type="button"
          className="type-label site-header__menu"
          aria-expanded={menuOpen}
          aria-controls="menu-partes"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
      </div>

      <div className="site-header__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${part / TOTAL})` }} />
      </div>

      {menuOpen && (
        <div
          ref={sheetRef}
          id="menu-partes"
          role="dialog"
          aria-modal="true"
          aria-label="Partes da apresentação"
          className="menu-sheet"
        >
          <div className="menu-sheet__panel page-x">
            <div className="menu-sheet__top">
              <span className="type-label">{company.name}</span>
              <button type="button" className="type-label" onClick={() => setMenuOpen(false)}>
                Fechar
              </button>
            </div>
            <ol className="menu-sheet__list">
              {partsOfFair.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`} aria-current={part === p.n ? "true" : undefined} onClick={onAnchor(p.id)}>
                    <span className="num menu-sheet__n">{p.n}</span>
                    <span>
                      <span className="menu-sheet__title">{p.title}</span>
                      <span className="type-caption">{p.aula}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </header>
  );
}
