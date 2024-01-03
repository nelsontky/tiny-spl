"use client";

import dynamic from "next/dynamic";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import { AppBar } from "./common/components/AppBar";
import { AppContainer } from "./common/components/AppContainer";
import { LoadingScreen } from "./common/components/LoadingScreen";
import { MainPage } from "./features/homepage/components/MainPage";

const WalletPage = dynamic(
  () =>
    import("./features/wallet/components/WalletPage").then(
      (mod) => mod.WalletPage
    ),
  {
    loading: () => <LoadingScreen />,
  }
);

const DeezNutsMintPage = dynamic(
  () =>
    import("./features/deez-nuts-mint/components/DeezNutsMintPage").then(
      (mod) => mod.DeezNutsMintPage
    ),
  {
    loading: () => <LoadingScreen />,
  }
);

const router =
  typeof document !== "undefined"
    ? createBrowserRouter([
        {
          path: "/",
          element: <Root />,
          children: [
            { index: true, element: <MainPage /> },
            // {
            //   path: "/mint",
            //   element: <DeezNutsMintPage />,
            // },
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
