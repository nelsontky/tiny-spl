import { useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { WrapperConnection } from "../utils/WrapperConnection";

export const useWrapperConnection = () => {
  const { connection } = useConnection();
  const rpcUrl = connection.rpcEndpoint;
  const commitment = connection.commitment;

  const wrapperConnection = useMemo(
    () => new WrapperConnection(rpcUrl, { commitment }),
    [rpcUrl, commitment]
  );

  return wrapperConnection;
};
