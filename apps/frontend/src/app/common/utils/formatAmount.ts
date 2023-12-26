export const formatAmount = (amount: string) =>
  Intl.NumberFormat("en-US", {
    currency: "USD",
  }).format(BigInt(amount));
