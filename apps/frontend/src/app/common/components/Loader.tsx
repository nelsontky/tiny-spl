"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "react95";

interface LoaderProps {
  incrementInterval?: number;
}

export const Loader = ({ incrementInterval }: LoaderProps) => {
  const [percent, setPercent] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((previousPercent) => {
        const diff = Math.random() * 10;
        return Math.min(previousPercent + diff, 95);
      });
    }, incrementInterval ?? 500);

    return () => {
      clearInterval(timer);
    };
  }, [incrementInterval]);

  return <ProgressBar variant="tile" value={Math.floor(percent)} />;
};
