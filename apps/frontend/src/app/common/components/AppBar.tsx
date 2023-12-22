import dynamic from "next/dynamic";
import { AppBar as React95AppBar, Toolbar } from "react95";
import styled from "styled-components";

const AppWalletMultiButton = dynamic(
  () =>
    import("./AppWalletMultiButton").then(
      ({ AppWalletMultiButton }) => AppWalletMultiButton
    ),
  { ssr: false }
);

const StyledAppWalletMultiButton = styled(AppWalletMultiButton)``;

export const AppBar = () => {
  return (
    <>
      <React95AppBar className="h-12">
        <Toolbar>
          <StyledAppWalletMultiButton />
        </Toolbar>
      </React95AppBar>
      <div className="h-12" />
    </>
  );
};
