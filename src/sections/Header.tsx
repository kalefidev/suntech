import { useEffect, useRef, useState } from "react";
import { company } from "../content/company";
import { getLenis } from "../lib/lenis";
import { ScrollTrigger, gsap } from "../lib/gsap";

const ANCHORS: { id: string; label: string }[] = [
  { id: "how-it-works", label: "Como funciona" },
  { id: "who-for", label: "Para quem" },
  { id: "about-us", label: "Quem somos" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  const top = el.getBoundingClientRect().top + window.scrollY;
  if (lenis) {
    lenis.scrollTo(top);
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(progressRef.current, { scaleX: self.progress });
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 text-[color:var(--fg)] md:px-10"
      style={{ pointerEvents: "none" }}
    >
      <span className="text-sm font-semibold tracking-normal" style={{ pointerEvents: "auto" }}>
        {company.name}
      </span>

      <nav className="hidden gap-8 text-sm md:flex" style={{ pointerEvents: "auto" }}>
        {ANCHORS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => scrollToId(a.id)}
            className="relative cursor-pointer border-none bg-transparent p-0 text-[color:var(--fg)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
          >
            {a.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="text-sm md:hidden"
        style={{ pointerEvents: "auto" }}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        Menu
      </button>

      <div className="bg-nuvem/20 absolute inset-x-0 bottom-0 h-px" style={{ pointerEvents: "none" }}>
        <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-sol" />
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="bg-noite text-nuvem fixed inset-0 z-30 flex flex-col items-center justify-center gap-8 text-xl md:hidden"
          style={{ pointerEvents: "auto" }}
        >
          {ANCHORS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                scrollToId(a.id);
              }}
              className="border-none bg-transparent"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
