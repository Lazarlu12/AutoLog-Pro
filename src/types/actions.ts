export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// Helper para construir respuestas exitosas
export const ok = <T>(data: T): ActionResult<T> => ({
  success: true,
  data,
})

// Helper para construir respuestas de error
export const fail = (
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> => ({
  success: false,
  error,
  fieldErrors,
})