import { Window, WindowHeader } from "react95";
import { useParams, useSearchParams } from "react-router-dom";

export const MintPage = () => {
  return (
    <div className="py-12">
      <Window className="w-full">
        <WindowHeader>Tiny SPLs</WindowHeader>
      </Window>
    </div>
  );
};
