import { useParams, useSearchParams } from "react-router-dom";
import { Window, WindowHeader } from "react95";

export const MintPage = () => {
  return (
    <div className="py-12">
      <Window className="w-full">
        <WindowHeader>Tiny SPLs</WindowHeader>
      </Window>
    </div>
  );
};
