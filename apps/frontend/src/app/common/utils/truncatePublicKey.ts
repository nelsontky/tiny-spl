export const truncatePublicKey = (base58: string): string =>
  base58.slice(0, 4) + ".." + base58.slice(-4);
