import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Decimal from "decimal.js";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Anchor,
  Avatar,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
  WindowContent,
} from "react95";

import { Loader } from "@/app/common/components/Loader";
import { ChevronLeft } from "@/app/common/icons/ChevronLeft";
import { formatAmount } from "@/app/common/utils/formatAmount";
import { generateXrayCollectionLink } from "@/app/common/utils/generateXrayCollectionLink";
import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";

import { useTinySplsByOwner } from "../../swr-hooks/hooks/useTinySplsByOwner";
import { TinySplRow } from "../../swr-hooks/types/TinySplRow";

const columns: ColumnDef<TinySplRow>[] = [
  {
    id: "logo",
    columns: [
      {
        header: "Logo",
        accessorKey: "logo",
        cell: (info) => (
          <div className="flex justify-center w-full">
            <Avatar square size={50} src={info.getValue()} />
          </div>
        ),
        enableSorting: false,
        meta: {
          headerClassName: "w-16",
        },
      },
    ],
  },
  {
    id: "name",
    columns: [
      {
        header: "Name",
        accessorKey: "collectionName",
        cell: (info) => {
          const collectionName = info.getValue();
          const collectionId = info.row.original.collectionId;

          return (
            <div className="overflow-hidden text-ellipsis">
              <div>{collectionName ?? ""}</div>
              <Anchor
                className="!text-sm"
                href={generateXrayCollectionLink(collectionId)}
                target="_blank"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {truncatePublicKey(collectionId, 8)}
              </Anchor>
            </div>
          );
        },
        sortingFn: (a, b) =>
          (a.original.collectionName ?? "")
            .toLowerCase()
            .localeCompare((b.original.collectionName ?? "").toLowerCase()),
      },
    ],
  },
  {
    id: "amount",
    columns: [
      {
        header: "Amount",
        accessorKey: "amount",
        cell: (info) => {
          const amount = info.getValue();
          const symbol = info.row.original.symbol;
          const formattedAmount = formatAmount(amount);

          return (
            <div className="text-wrap break-all	leading-tight">
              {formattedAmount} {symbol}
            </div>
          );
        },
        sortingFn: (a, b) =>
          new Decimal(a.original.amount).cmp(b.original.amount),
      },
    ],
  },
];

export const TinySplList = () => {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { data } = useTinySplsByOwner(publicKey);
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableHeaders = table.getHeaderGroups().at(-1);
  const tableHead = !tableHeaders ? null : (
    <TableHead>
      <TableRow>
        {tableHeaders.headers.map((header) => {
          return (
            <TableHeadCell
              key={header.id}
              disabled={!header.column.getCanSort()}
              onClick={header.column.getToggleSortingHandler()}
              className={
                (header.getContext().column.columnDef.meta as any)
                  ?.headerClassName
              }
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
      </TableRow>
    </TableHead>
  );

  if (!data) {
    return (
      <>
        <Table>{tableHead}</Table>
        <WindowContent>
          <Loader />
        </WindowContent>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <Table>{tableHead}</Table>
        <WindowContent className="text-center">
          No Tiny SPLs found in this wallet 🥺
          <Anchor as={Link} {...{ to: "/mint" }}>
            here
          </Anchor>
          !
        </WindowContent>
      </>
    );
  }

  return (
    <Table className="h-[1px] table-fixed">
      {tableHead}
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          return (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableDataCell key={cell.id}>
                    <Link
                      className="flex items-center w-full h-full"
                      to={`/${publicKey}?mint=${row.original.collectionId}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Link>
                  </TableDataCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
