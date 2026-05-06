/**
 * Детерминированный UUID для стабильных моков (тот же seed → тот же id).
 * Не для криптографии; достаточно для формата Guid на бэке.
 *
 * Важно: прежний вариант со свёрткой XOR в 16 байт давал массовые коллизии
 * для разных строк — дубли ключей в React и «спам» в консоли.
 */
function fnv1a32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function kbSeedUuid(seed: string): string {
  const base = `kb:${seed}`;
  const w0 = fnv1a32(base);
  const w1 = fnv1a32(`${base}\u0000${w0}`);
  const w2 = fnv1a32(`${base}\u0001${w1}`);
  const w3 = fnv1a32(`${base}\u0002${w2}`);
  const hex =
    w0.toString(16).padStart(8, '0') +
    w1.toString(16).padStart(8, '0') +
    w2.toString(16).padStart(8, '0') +
    w3.toString(16).padStart(8, '0');
  const part3 = ((parseInt(hex.slice(12, 16), 16) & 0x0fff) | 0x4000).toString(16).padStart(4, '0');
  const part4 = ((parseInt(hex.slice(16, 20), 16) & 0x3fff) | 0x8000).toString(16).padStart(4, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${part3}-${part4}-${hex.slice(20, 32)}`;
}

export function kbQuickLinkIdFor(seed: string): string {
  return kbSeedUuid(`quicklink:${seed}`);
}
