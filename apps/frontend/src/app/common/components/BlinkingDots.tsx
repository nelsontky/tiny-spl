import clsx from "clsx";

export const BlinkingDots = ({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <span>
    {Array.from({ length: count }, (_, i) => (
      <span
        key={i}
        className={clsx("animate-blink", className)}
        style={{
          animationDelay: `${i * 250}ms`,
        }}
      >
        .
      </span>
    ))}
  </span>
);
