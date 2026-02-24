import { validateClientEnv } from "./env/client";
import { validateServerEnv } from "./env/server";

export function validateEnv() {
  const serverValidation = validateServerEnv();
  const clientValidation = validateClientEnv();

  if (!serverValidation.success) {
    return { success: false, error: serverValidation.error };
  }
  if (!clientValidation.success) {
    return { success: false, error: clientValidation.error };
  }
  return { success: true };
}
