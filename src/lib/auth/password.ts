import crypto from "node:crypto";

const SALT_LEN = 16;
const KEY_LEN = 64;

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LEN).toString("hex");
    crypto.scrypt(password, salt, KEY_LEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return resolve(false);

    const [salt, key] = parts;
    crypto.scrypt(password, salt, KEY_LEN, (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(key, "hex");
      const match = crypto.timingSafeEqual(keyBuffer, derivedKey);
      resolve(match);
    });
  });
}
