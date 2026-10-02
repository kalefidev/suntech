// Flags de GL do Chromium dos scripts. No Windows, a GPU da máquina (ANGLE
// sobre D3D11): ~15 ms por quadro em 1080p contra ~1 s do SwiftShader, e as
// fotos mostram o tier de qualidade real (no SwiftShader, o
// PerformanceMonitor desce para o baixo). SNAP_GL=swiftshader força o
// renderizador por software (máquina sem GPU, ou para comparar).
export const GL_ARGS =
  process.env.SNAP_GL === "swiftshader" || process.platform !== "win32"
    ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    : ["--use-angle=d3d11", "--ignore-gpu-blocklist"];
