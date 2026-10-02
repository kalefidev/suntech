// Aceite da Fase 6 (M8, docs/fase-0.md): o modo pitch com o relógio falso do
// Playwright (`page.clock`). Roda os 180 s em segundos de verdade e confere:
// as paradas nos tempos do feira.ts, a pausa no Espaço (o relógio congela),
// o fim em exatamente 3:00 e a saída no Esc, com o foco de volta no botão.
// Também com reduced motion (pula de parada em parada nos mesmos tempos).
// Usa o build em dist/ (rode `npm run build` antes) e sobe o próprio preview.
// Uso: node scripts/pitch-test.mjs
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { GL_ARGS } from "./gl.mjs";

const PORT = 4176;
const BASE = `http://localhost:${PORT}`;
const failures = [];

function startPreview() {
  return new Promise((resolve, reject) => {
    const vite = path.resolve("node_modules/vite/bin/vite.js");
    const child = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort"], { stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (chunk) => {
      if (!ready && chunk.toString().includes("http://localhost")) {
        ready = true;
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("exit", (code) => {
      if (!ready) reject(new Error(`vite preview saiu com código ${code}`));
    });
  });
}

function check(label, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${label}${detail ? ` (${detail})` : ""}`);
  if (!ok) failures.push(label);
}

/** O que o HUD mostra agora (ou null, sem pitch). */
const hud = (page) =>
  page.evaluate(() => {
    const el = document.querySelector(".pitch-hud");
    if (!el) return null;
    return {
      clock: el.querySelector(".pitch-hud__clock span")?.textContent ?? "",
      stop: el.querySelector(".pitch-hud__stop")?.textContent ?? "",
      sector: el.querySelector(".pitch-hud__sector")?.textContent ?? "",
      button: el.querySelector(".pitch-hud__button")?.textContent ?? "",
      live: document.querySelector(".pitch-live")?.textContent ?? "",
    };
  });

async function openPage(browser, reduced) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  // O relógio falso entra antes da página: o GSAP (rAF e Date) passa a andar com ele.
  await page.clock.install();
  // Sem WebGL: o pitch não depende da cena, e 180 s de quadros ficam leves.
  await page.goto(`${BASE}/?snap&nowebgl`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  // Daqui em diante, o tempo só anda quando o teste manda.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
  return { page, context, errors };
}

/** Começa o pitch pelo botão da Parte 5 (clique por JS: com o relógio parado, não há quadros). */
const start = (page, selector) =>
  page.evaluate((s) => {
    const button = document.querySelector(s);
    button.focus();
    button.click();
  }, selector);

async function fullRun(browser, reduced) {
  const tag = reduced ? "[reduced motion]" : "[normal]";
  const { page, context, errors } = await openPage(browser, reduced);
  await start(page, ".pitch-start .btn-cta");
  await page.clock.runFor(100);
  let s = await hud(page);
  check(`${tag} o HUD abre em 0:00 na situação-problema`, s?.clock === "0:00" && s?.stop === "Situação-problema", JSON.stringify(s));
  check(`${tag} a parada é anunciada (aria-live)`, s?.live === "Marketing: Situação-problema", s?.live);

  await page.clock.runFor(30_000);
  s = await hud(page);
  check(`${tag} 0:30 na persona`, s?.clock === "0:30" && s?.stop === "Persona", JSON.stringify(s));

  // Espaço pausa: o relógio do pitch congela enquanto o tempo passa.
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
  await page.keyboard.press(" ");
  await page.clock.runFor(20_000);
  s = await hud(page);
  check(`${tag} Espaço pausa (o relógio fica em 0:30)`, s?.clock === "0:30" && s?.button === "Continuar", JSON.stringify(s));
  await page.keyboard.press(" ");
  await page.clock.runFor(29_000);
  s = await hud(page);
  check(`${tag} Espaço retoma`, s?.clock === "0:59", JSON.stringify(s));

  await page.clock.runFor(1_000);
  s = await hud(page);
  check(`${tag} 1:00 em "Por dentro" (Produtos)`, s?.clock === "1:00" && s?.stop === "Por dentro" && s?.sector === "Produtos", JSON.stringify(s));

  await page.clock.runFor(119_000);
  s = await hud(page);
  check(`${tag} 2:59 em "Preço", ainda no ar`, s?.clock === "2:59" && s?.stop === "Preço", JSON.stringify(s));

  await page.clock.runFor(1_100);
  s = await hud(page);
  const focused = await page.evaluate(() => document.activeElement?.matches(".pitch-start .btn-cta") ?? false);
  check(`${tag} acaba em exatamente 3:00 e devolve o foco ao botão`, s === null && focused, JSON.stringify({ s, focused }));
  check(`${tag} sem erros no console`, errors.length === 0, errors.join(" | "));
  await context.close();
}

async function escapeRun(browser) {
  const { page, context } = await openPage(browser, false);
  await start(page, ".final__cta");
  await page.clock.runFor(5_000);
  await page.keyboard.press("Escape");
  await page.clock.runFor(100);
  const s = await hud(page);
  const focused = await page.evaluate(() => document.activeElement?.matches(".final__cta") ?? false);
  check("[Esc] sai do pitch e devolve o foco ao botão do final", s === null && focused, JSON.stringify({ s, focused }));
  await context.close();
}

const preview = await startPreview();
const browser = await chromium.launch({ args: GL_ARGS });
try {
  await fullRun(browser, false);
  await fullRun(browser, true);
  await escapeRun(browser);
} finally {
  await browser.close();
  preview.kill();
}
if (failures.length) {
  console.error(`\npitch: ${failures.length} falha(s).`);
  process.exit(1);
}
console.log("\npitch: tudo certo (180 s exatos, pausa no Espaço, saída no Esc).");
