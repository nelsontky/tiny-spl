import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { useEffect, useMemo } from "react";
import { redirect, useNavigate } from "react-router-dom";
import {
  Anchor,
  Avatar,
  Separator,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";

import { formatAmount } from "@/app/common/utils/formatAmount";

import { Faq } from "../../../common/components/Faq";
// import { useMintedSupply } from "../hooks/useMintedSupply";
import { MintButton } from "./MintButton";

const COLLECTION_ID = "DEEZyno8D9RCCghEWkTNarZrCW7HvvWE9z64tiqvQKpH";

export const DeezNutsMintPage = () => {
  const navigate = useNavigate();
  useEffect(
    function redirect() {
      navigate("/");
    },
    [navigate]
  );

  return null;
};
