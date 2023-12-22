"use client";

import { AppBar } from "./common/components/AppBar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppContainer } from "./common/components/AppContainer";
import { MainPage } from "./features/homepage/components/MainPage";
import { WalletPage } from "./features/wallet/components/WalletPage";

const router =
  typeof document !== "undefined"
    ? createBrowserRouter([
        {
          path: "/",
          element: <MainPage />,
        },
        {
          path: "/:publicKey",
          element: <WalletPage />,
        },
      ])
    : undefined;

export default function Home() {
  if (!router) {
    return null;
  }

  return (
    <>
      <AppBar />
      <AppContainer className="flex-1">
        <RouterProvider router={router} />
      </AppContainer>
    </>
  );
}
