/** Offline demo only — replace with real auth before production. */
export const DEMO_ACCOUNT = {
  email: "demo@app.local",
  password: "demo1234",
} as const;

export function matchesDemoAccount(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_ACCOUNT.email.toLowerCase() &&
    password === DEMO_ACCOUNT.password
  );
}
