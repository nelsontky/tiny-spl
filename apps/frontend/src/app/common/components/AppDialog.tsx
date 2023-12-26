import clsx from "clsx";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface AppDialogProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AppDialog = ({ open, children, className }: AppDialogProps) => {
  useEffect(
    function removeScroll() {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    },
    [open]
  );

  if (!open) {
    return null;
  }

  return createPortal(
    <>
      <div className="fixed w-full h-full top-0 left-0" />
      <div
        className={clsx(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          className
        )}
      >
        {children}
      </div>
    </>,
    document.body
  );
};
