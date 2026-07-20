// Хэш-функция FNV-1a для детерминированной генерации значений
export function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Генератор псевдослучайных чисел Mulberry32
export function mulberry32(seedCode: number): () => number {
  let a = seedCode;
  return function(): number {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getStableRandomWithHash(charIndex: number, charCode: number, saltHash: number): number {
  const seed = saltHash ^ charIndex ^ charCode;
  return mulberry32(seed)();
}

export function generateSecureKey(): string {
  const array = new Uint32Array(3);
  window.crypto.getRandomValues(array);
  return Array.from(array, (val) => val.toString(36)).join('-').toUpperCase();
}
