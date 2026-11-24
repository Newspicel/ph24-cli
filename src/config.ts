// Profiles with API tokens, stored in ~/.config/ph24/config.json (mode 0600).
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Profile {
  token?: string;
  project?: string;
  project_name?: string;
  api_url?: string;
}

export interface Config {
  current?: string;
  profiles: Record<string, Profile>;
}

export function configDir(): string {
  if (process.env.PH24_CONFIG_DIR) return process.env.PH24_CONFIG_DIR;
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(base, "ph24");
}

export const configPath = () => join(configDir(), "config.json");

export function loadConfig(): Config {
  const p = configPath();
  if (!existsSync(p)) return { profiles: {} };
  try {
    const c = JSON.parse(readFileSync(p, "utf8"));
    return { current: c.current, profiles: c.profiles ?? {} };
  } catch {
    throw new Error("Could not read " + p + " (invalid JSON). Fix or delete it.");
  }
}

export function saveConfig(c: Config) {
  const dir = configDir();
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const p = configPath();
  writeFileSync(p, JSON.stringify(c, null, 2) + "\n", { mode: 0o600 });
  chmodSync(p, 0o600);
}

export function removeConfigFile(name: string) {
  const p = join(configDir(), name);
  if (existsSync(p)) rmSync(p);
}

export interface Context {
  profileName: string;
  profile: Profile;
  token?: string;
  tokenSource?: "env" | "profile";
  project?: string;
  projectSource?: "flag" | "env" | "profile";
  apiUrl: string;
}

export const DEFAULT_API_URL = "https://ph24.io/api/v1";

export function resolveContext(opts: { profile?: string; project?: string; apiUrl?: string }): Context {
  const cfg = loadConfig();
  const profileName = opts.profile || process.env.PH24_PROFILE || cfg.current || "default";
  const profile = cfg.profiles[profileName] ?? {};
  const envToken = process.env.PH24_API_TOKEN;
  const ctx: Context = {
    profileName,
    profile,
    token: envToken || profile.token,
    tokenSource: envToken ? "env" : profile.token ? "profile" : undefined,
    apiUrl: (opts.apiUrl || process.env.PH24_API_URL || profile.api_url || DEFAULT_API_URL).replace(/\/+$/, ""),
  };
  if (opts.project) { ctx.project = opts.project; ctx.projectSource = "flag"; }
  else if (process.env.PH24_PROJECT) { ctx.project = process.env.PH24_PROJECT; ctx.projectSource = "env"; }
  else if (profile.project) { ctx.project = profile.project; ctx.projectSource = "profile"; }
  return ctx;
}

export function maskToken(t?: string): string | undefined {
  if (!t) return undefined;
  if (t.length <= 12) return t.slice(0, 5) + "…";
  return t.slice(0, 9) + "…" + t.slice(-4);
}
