export const truncatePublicKey = (base58: string, length?: number): string =>
  base58.slice(0, length ?? 5) + ".." + base58.slice(-1 * (length ?? 5));
