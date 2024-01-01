"use client";

import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import { AppBar } from "./common/components/AppBar";
import { AppContainer } from "./common/components/AppContainer";
import { MainPage } from "./features/homepage/components/MainPage";
import { WalletPage } from "./features/wallet/components/WalletPage";

const router =
  typeof document !== "undefined"
    ? createBrowserRouter([
        {
          path: "/",
          element: <Root />,
          children: [
            { index: true, element: <MainPage /> },
            {
              path: "/:publicKey",
              element: <WalletPage />,
            },
          ],
        },
      ])
    : undefined;

export default function Home() {
  if (!router) {
    return null;
  }

  return <RouterProvider router={router} />;
}

function Root() {
  return (
    <>
      <AppBar />
      <AppContainer className="flex-1">
        <Outlet />
      </AppContainer>
    </>
  );
}
