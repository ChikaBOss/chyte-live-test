import jwt, { SignOptions } from "jsonwebtoken";

// Helper to ensure environment variable exists
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined!`);
  }
  return value;
}

// Guaranteed string type
const JWT_SECRET = getEnvVar("NEXTAUTH_SECRET");

/**
 * Sign a payload into a JWT token
 * @param payload - The data to encode in the token
 * @param expiresIn - Expiration time (default: '7d')
 * @returns JWT token as a string
 */
export function signToken(payload: object, expiresIn: string = "7d"): string {
  // Cast expiresIn as any to satisfy TS in jsonwebtoken v9+
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify a JWT token and decode the payload
 * @param token - The JWT token to verify
 * @returns The decoded payload
 */
export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}