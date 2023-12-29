import { Tooltip } from "react95";

export const CombineAndSplitHelp = () => (
  <Tooltip
    text={
      (
        <div className="text-left">
          <div>
            Since tiny SPL balances are grouped, if you want to send a specific
            amount,
          </div>
          <div>
            you will have to spilt/combine the balances before sending them out
            via your wallet.
          </div>
        </div>
      ) as any
    }
    enterDelay={0}
  >
    <img
      width={20}
      height={20}
      className="cursor-help"
      src="/assets/help.png"
      alt="help"
    />
  </Tooltip>
);
