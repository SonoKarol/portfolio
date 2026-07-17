/**
 * Rileva se il browser supporta WebGL (2 o 1).
 * Da chiamare solo lato client (es. dentro useEffect).
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return gl !== null;
  } catch {
    return false;
  }
}
