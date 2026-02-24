import { validateEnv } from "./config/env.config";
import { $ZodIssue } from "zod/v4/core";

function mapZodErrors(errors: $ZodIssue[]): string[] {
  return errors.map((error, index) => {
    const path = error.path.join(".");
    return `Error ${index + 1}: ${error.message} at path "${path}"`;
  });
}

export async function register() {
  const validationResult = validateEnv();

  if (!validationResult.success && validationResult.error) {
    const errorMessages = mapZodErrors(validationResult.error.issues);
    console.error("Environment variable validation failed with the following errors:");
    errorMessages.forEach((message) => console.error(message));
    throw new Error("Environment variable validation failed. Please check the logs for details.");
  }

  console.log("Environment variables validated successfully.");
}
