import { WindowContent } from "react95";

import { Loader } from "./Loader";

export const ConfirmingTransaction = () => {
  return (
    <div className="w-full">
      <img
        className="w-full"
        src="/assets/ie-download.gif"
        alt="Confirming transaction"
      />
      <Loader incrementInterval={1000} />
    </div>
  );
};
