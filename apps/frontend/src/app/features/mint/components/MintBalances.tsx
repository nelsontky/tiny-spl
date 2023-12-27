import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import {
  Anchor,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from "react95";

import { ChevronLeft } from "@/app/common/icons/ChevronLeft";
import { formatAmount } from "@/app/common/utils/formatAmount";
import { generateXrayCollectionLink } from "@/app/common/utils/generateXrayCollectionLink";
import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

import { getAssetAmount } from "../../swr-hooks/utils/getAssetAmount";
import { CombineTaskbar } from "./CombineTaskbar";
import { SplitDialog } from "./SplitDialog";

const MAX_MINTS_TO_COMBINE = 2;

const columns: ColumnDef<ReadApiAsset>[] = [
  {
    id: "id",
    columns: [
      {
        header: "ID",
        accessorKey: "id",
        cell: (info) => (
          <Anchor
            className="break-all"
            href={generateXrayCollectionLink(info.getValue() ?? "")}
            target="_blank"
          >
            {info.getValue()}
          </Anchor>
        ),
        sortingFn: (a, b) =>
          (a.original.id ?? "")
            .toLowerCase()
            .localeCompare((b.original.id ?? "").toLowerCase()),
      },
    ],
  },
  {
    id: "amount",
    columns: [
      {
        header: "Amount",
        accessorKey: "content",
        cell: (info) => {
          const amount = getAssetAmount(info.row.original);
          return formatAmount(amount);
        },
        sortingFn: (a, b) =>
          new Decimal(getAssetAmount(a.original)).cmp(
            new Decimal(getAssetAmount(b.original))
          ),
      },
    ],
  },
];

interface MintBalancesProps {
  balances: ReadApiAsset[];
  mutate: () => Promise<any>;
}

export const MintBalances = ({ balances, mutate }: MintBalancesProps) => {
  const [mintToSplit, setMintToSplit] = useState<ReadApiAsset | null>(null);
  const [selectedMints, setSelectedMints] = useState<
    Record<string, ReadApiAsset>
  >({});
  const mintCount = Object.keys(selectedMints).length;

  useEffect(
    function resetSelectedMints() {
      setSelectedMints({});
    },
    [balances]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: balances,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableHeaders = table.getHeaderGroups().at(-1);

  if (!tableHeaders) {
    return null;
  }

  const renderCombineCheckbox = (asset: ReadApiAsset) => {
    const checked = !!selectedMints[asset.id];
    const hasHitMaxSelected = mintCount >= MAX_MINTS_TO_COMBINE;
    const disabled = !checked && hasHitMaxSelected;

    const checkbox = (
      <Checkbox
        className="[&>div:before]:box-content [&>div>span:after]:box-content [&>div>span]:h-[20px]"
        disabled={disabled}
        checked={checked}
        onChange={(e) => {
          const checked = e.target.checked;

          setSelectedMints((prev) => {
            if (checked) {
              return {
                ...prev,
                [asset.id]: asset,
              };
            }

            delete prev[asset.id];
            return { ...prev };
          });
        }}
      />
    );

    if (disabled) {
      return (
        <Tooltip
          className="text-black"
          text={`You can only combine ${MAX_MINTS_TO_COMBINE} balances at a time`}
          enterDelay={0}
        >
          {checkbox}
        </Tooltip>
      );
    }

    return checkbox;
  };

  return (
    <>
      <SplitDialog
        mintDetails={mintToSplit}
        onClose={() => {
          setMintToSplit(null);
        }}
        mutate={mutate}
      />
      <CombineTaskbar
        mutate={mutate}
        selectedMints={selectedMints}
        setSelectedMints={setSelectedMints}
      />
      <Table className="h-[1px]">
        <TableHead>
          <TableRow>
            <TableHeadCell disabled>Combine</TableHeadCell>
            {tableHeaders.headers.map((header) => {
              return (
                <TableHeadCell
                  key={header.id}
                  disabled={!header.column.getCanSort()}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex justify-between items-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <ChevronLeft width={24} className="rotate-90" />,
                      desc: <ChevronLeft width={24} className="-rotate-90" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHeadCell>
              );
            })}
            <TableHeadCell disabled />
          </TableRow>
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const amount = getAssetAmount(row.original);
            const splitButton = new Decimal(amount).lessThanOrEqualTo(1) ? (
              <Tooltip
                className="text-black"
                text="Amount needs to be more than 1 for balance to be split"
                enterDelay={0}
              >
                <Button disabled>Split</Button>
              </Tooltip>
            ) : (
              <Button
                onClick={() => {
                  setMintToSplit(row.original);
                }}
              >
                Split
              </Button>
            );

            return (
              <TableRow key={row.id} className="!h-14">
                <TableDataCell className="flex justify-center !py-1">
                  {renderCombineCheckbox(row.original)}
                </TableDataCell>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableDataCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableDataCell>
                  );
                })}
                <TableDataCell className="flex justify-center">
                  {splitButton}
                </TableDataCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
