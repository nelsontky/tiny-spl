import Decimal from "decimal.js";
import { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";

import { AppDialog } from "@/app/common/components/AppDialog";
import { formatAmount } from "@/app/common/utils/formatAmount";
import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

import { getAssetAmount } from "../../swr-hooks/utils/getAssetAmount";
import { getSplitError } from "../utils/getSplitError";

interface SplitDialogProps {
  mintDetails: ReadApiAsset | null;
  onClose: () => void;
}

export const SplitDialog = ({ mintDetails, onClose }: SplitDialogProps) => {
  const amount = !mintDetails ? undefined : getAssetAmount(mintDetails);
  const [leftAmount, setLeftAmount] = useState<string>();
  const [rightAmount, setRightAmount] = useState<string>();

  const splitError = getSplitError(leftAmount, rightAmount);

  const initialAmountsSet = useRef(false);
  useEffect(
    function setInitialAmounts() {
      if (!amount || initialAmountsSet.current) {
        return;
      }

      const left = new Decimal(amount).div(2).ceil();
      const right = new Decimal(amount).sub(left);

      setLeftAmount(left.toFixed());
      setRightAmount(right.toFixed());

      initialAmountsSet.current = true;
    },
    [amount]
  );

  useEffect(
    function resetRef() {
      return () => {
        initialAmountsSet.current = false;
      };
    },
    [mintDetails]
  );

  if (!amount || !mintDetails) {
    return null;
  }

  return (
    <AppDialog open={!!mintDetails} className="w-full max-w-2xl">
      <Window className="w-full">
        <WindowHeader className="flex justify-between items-center">
          <span>Split token</span>
          <Button onClick={onClose}>
            <span className="close-icon" />
          </Button>
        </WindowHeader>
        <WindowContent>
          Split{" "}
          <span className="font-bold">
            {formatAmount(amount)} {mintDetails.content.metadata?.symbol ?? ""}
          </span>{" "}
          into
          <div className="flex gap-2 items-center mt-4">
            <div className="flex gap-1 items-center">
              <NumericFormat
                isAllowed={(values) => {
                  const value = new Decimal(!values.value ? "0" : values.value);
                  return value.lt(amount);
                }}
                allowNegative={false}
                decimalScale={0}
                value={leftAmount}
                onValueChange={(values) => {
                  setLeftAmount(values.value);

                  const value = new Decimal(!values.value ? "0" : values.value);
                  const rightAmount = new Decimal(amount).sub(value);
                  setRightAmount(rightAmount.toFixed());
                }}
                thousandSeparator=","
                customInput={TextInput}
              />
              <span className="font-bold">
                {mintDetails.content.metadata?.symbol ?? ""}
              </span>
            </div>
            and
            <div className="font-bold">
              <span>
                {formatAmount(rightAmount ?? "0")}{" "}
                {mintDetails.content.metadata?.symbol ?? ""}
              </span>
            </div>
          </div>
          <span className="text-sm">{splitError}</span>
          <div className="flex justify-end">
            <Button disabled={!!splitError} className="font-bold">
              Split
            </Button>
          </div>
        </WindowContent>
      </Window>
    </AppDialog>
  );
};
