import { createHash, timingSafeEqual } from 'crypto';

export function mysql41PasswordHash(password: string): string {
  // 1차 SHA1 (binary)
  const h1 = createHash('sha1').update(password, 'utf8').digest();
  // 2차 SHA1 (hex)
  const h2 = createHash('sha1').update(h1).digest('hex').toUpperCase();
  return '*' + h2;
}

export function mysql41PasswordVerify(password: string, hash: string): boolean {
  const calc = Buffer.from(mysql41PasswordHash(password));
  const stored = Buffer.from(hash);
  // 상수시간 비교
  return (
    calc.length === stored.length &&
    timingSafeEqual(calc, stored)
  );
}
