import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SFX_DIR = resolve(__dirname, "..", "assets", "sfx");
export const BGM_DIR = resolve(__dirname, "..", "assets", "bgm");
export const AVATAR_PATH = resolve(__dirname, "..", "assets", "avatar.png");
