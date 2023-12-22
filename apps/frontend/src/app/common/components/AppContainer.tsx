import { clsx } from "clsx";

export const AppContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={clsx("max-w-2xl w-full px-6 mx-auto", className)}>
    {children}
  </div>
);
