import Decimal from "decimal.js";

export const getSplitError = (
  leftAmount: string | undefined,
  rightAmount: string | undefined
): string | null => {
  if (!leftAmount || !rightAmount) {
    return "Split amount is required";
  }

  if (
    // new Decimal(leftAmount).lessThanOrEqualTo(0) ||
    // new Decimal(rightAmount).lessThanOrEqualTo(0)
    new Decimal(leftAmount).lessThanOrEqualTo(99) ||
    new Decimal(rightAmount).lessThanOrEqualTo(99)
  ) {
    return "Both split amounts must be greater or equal to 100. This is to currently combat scam situations where users list 1 single token at a high price. We are working on a better solution and will update this soon.";
  }

  return null;
};
