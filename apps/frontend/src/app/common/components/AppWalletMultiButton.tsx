import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MenuList, MenuListItem } from "react95";

import { truncatePublicKey } from "../utils/truncatePublicKey";
import { BaseWalletConnectionButton } from "./AppBaseWalletConnectionButton";
import { AppWalletButtonProps } from "./AppWalletButton";

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Select Wallet",
} as const;

type Props = AppWalletButtonProps;

export function AppWalletMultiButton({ children, ...props }: Props) {
  const { setVisible: setModalVisible } = useWalletModal();
  const {
    buttonState,
    onConnect,
    onDisconnect,
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      setMenuOpen(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  const content = useMemo(() => {
    if (children) {
      return children;
    } else if (publicKey) {
      const base58 = publicKey.toBase58();
      return truncatePublicKey(base58);
    } else if (buttonState === "connecting" || buttonState === "has-wallet") {
      return LABELS[buttonState];
    } else {
      return LABELS["no-wallet"];
    }
  }, [buttonState, LABELS, publicKey]);

  return (
    <div className="relative">
      <BaseWalletConnectionButton
        {...props}
        open={menuOpen}
        style={{ pointerEvents: menuOpen ? "none" : "auto" }}
        onClick={() => {
          switch (buttonState) {
            case "no-wallet":
              setModalVisible(true);
              break;
            case "has-wallet":
              if (onConnect) {
                onConnect();
              }
              break;
            case "connected":
              setMenuOpen(true);
              break;
          }
        }}
        walletIcon={walletIcon}
        walletName={walletName}
      >
        {content}
      </BaseWalletConnectionButton>
      <MenuList
        ref={ref}
        className={clsx("!absolute left-0 top-full", !menuOpen && "!hidden")}
      >
        {publicKey ? (
          <MenuListItem
            className="wallet-adapter-dropdown-list-item"
            onClick={async () => {
              await navigator.clipboard.writeText(publicKey.toBase58());
              setCopied(true);
              setTimeout(() => setCopied(false), 400);
            }}
            role="menuitem"
          >
            {copied ? LABELS["copied"] : LABELS["copy-address"]}
          </MenuListItem>
        ) : null}
        <MenuListItem
          className="wallet-adapter-dropdown-list-item"
          onClick={() => {
            setModalVisible(true);
            setMenuOpen(false);
          }}
          role="menuitem"
        >
          {LABELS["change-wallet"]}
        </MenuListItem>
        {onDisconnect ? (
          <MenuListItem
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              onDisconnect();
              setMenuOpen(false);
            }}
            role="menuitem"
          >
            {LABELS["disconnect"]}
          </MenuListItem>
        ) : null}
      </MenuList>
    </div>
  );
}
