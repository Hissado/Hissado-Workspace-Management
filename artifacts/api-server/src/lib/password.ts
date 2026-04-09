/**
 * Secure password hashing using Node.js built-in `crypto.scrypt`.
 *
 * scrypt is a memory-hard KDF designed to resist brute-force attacks even with
 * GPU hardware. It is built into every Node.js installation — no additional
 * dependencies required.
 *
 * Hash format: `scrypt:<salt>:<hash>` (both hex-encoded).
 * This prefix allows future algorithm migrations without breaking existing hashes.
 */

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// scrypt parameters — these are deliberately conservative to balance security
// and response latency on a single-core deployment.
const SALT_BYTES = 16;   // 128-bit salt
const KEY_LEN    = 64;   // 512-bit derived key
const COST_N     = 16384; // CPU/memory cost parameter (N)

/**
 * Hashes a plain-text password.
 * Returns an opaque string that can be stored in the database / JSON file.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = (await scryptAsync(plain, salt, KEY_LEN, { N: COST_N })) as Buffer;
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verifies a candidate password against a stored hash.
 * Uses `timingSafeEqual` to prevent timing-based side-channel attacks.
 *
 * Also accepts the legacy plain-text format (any string not starting with
 * "scrypt:") so that existing seed users continue to work until their
 * passwords are rehashed on next login.
 */
export async function verifyPassword(
  candidate: string,
  stored: string,
): Promise<boolean> {
  if (!stored.startsWith("scrypt:")) {
    // Legacy plain-text comparison — only reachable for seed/dev users whose
    // passwords have not yet been migrated. A successful login will trigger
    // an immediate rehash (see users route).
    return candidate === stored;
  }

  const parts = stored.split(":");
  if (parts.length !== 3) return false;

  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex!, "hex");
  const expectedHash = Buffer.from(hashHex!, "hex");

  try {
    const candidateHash = (await scryptAsync(candidate, salt, KEY_LEN, { N: COST_N })) as Buffer;
    return timingSafeEqual(candidateHash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Returns true if the stored password string uses the legacy plain-text format
 * and should be rehashed on the next successful login.
 */
export function needsRehash(stored: string): boolean {
  return !stored.startsWith("scrypt:");
}
