/**
 * Progresso real do loader (seção 7 do brief: "nada de progresso falso").
 * Todas as tarefas são declaradas de uma vez, com peso, para a barra nunca
 * andar para trás quando uma tarefa nova aparece.
 */

export const LOAD_TASKS = {
  /** Archivo com os eixos de peso e largura. */
  font: 1,
  /** Chunk da cena 3D (three + R3F). */
  scene: 3,
  /** Texturas procedurais em canvas. */
  textures: 2,
  /** Compilação dos shaders (`renderer.compileAsync`). */
  shaders: 2,
} as const;

export type LoadTask = keyof typeof LOAD_TASKS;

const done = new Set<LoadTask>();
const listeners = new Set<(progress: number) => void>();
const total = Object.values(LOAD_TASKS).reduce((a, b) => a + b, 0);

export function progress(): number {
  let sum = 0;
  done.forEach((task) => (sum += LOAD_TASKS[task]));
  return sum / total;
}

export function complete(task: LoadTask): void {
  if (done.has(task)) return;
  done.add(task);
  const p = progress();
  listeners.forEach((listener) => listener(p));
}

/** Marca a tarefa como concluída quando a promessa terminar (dando certo ou não). */
export function track<T>(task: LoadTask, promise: Promise<T>): Promise<T> {
  return promise.finally(() => complete(task));
}

/** Sem WebGL (ou com falha): as tarefas da cena não vão acontecer. */
export function completeScene(): void {
  complete("scene");
  complete("textures");
  complete("shaders");
}

export function onProgress(listener: (progress: number) => void): () => void {
  listeners.add(listener);
  listener(progress());
  return () => listeners.delete(listener);
}
