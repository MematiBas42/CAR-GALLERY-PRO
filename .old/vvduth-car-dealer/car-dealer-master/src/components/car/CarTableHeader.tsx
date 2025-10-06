"use client";
import { sortOrder } from "@/config/constants";
import { CarKeys, PageProps } from "@/config/types";
import { Classified } from "@prisma/client";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import React from "react";
import { TableHead, TableHeader, TableRow } from "../ui/table";
import { SortIcon } from "../shared/sort-icon";
const carKeys = [
  "status",
  "title",
  "vrm",
  "id",
  "views",
  "year",
  "colour",
  "price",
  "createdAt",
] as const;

interface CarTableProps extends PageProps {
  cars: Classified[];
  sort: CarKeys;
  order: "asc" | "desc";
  currentPage: number;
  totalPages: number;
}
type CarTableHeaderProps = Pick<CarTableProps, "sort" | "order">;

const CarTableHeader = (props: CarTableHeaderProps) => {
  const { sort: initialSort, order: initialOrder } = props;
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(carKeys).withDefault(initialSort).withOptions({
      shallow: false,
    })
  );
  const [order, setOrder] = useQueryState(
    "order",
    parseAsStringLiteral(sortOrder).withDefault(initialOrder).withOptions({
      shallow: false,
    })
  );

  const handleSort = (newSort: CarKeys) => {
    if (newSort === sort) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(newSort);
      setOrder("asc");
    }
  };
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent border-gray-800">
        <TableHead className="text-muted w-[80px]">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleSort("id")}
          >
            ID
            <SortIcon<CarKeys>
              sort="id"
              currentSort={sort}
              currentOrder={order as "asc" | "desc" | null}
            />
          </div>
        </TableHead>
        <TableHead className="text-muted w-[80px]">Image</TableHead>
        <TableHead className="text-muted w-[150px]">Title</TableHead>
        <TableHead className="text-muted w-[150px]">
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => handleSort("price")}
						onKeyDown={() => handleSort("price")}
					>
						Price
						<SortIcon<CarKeys>
							currentSort={sort}
							currentOrder={order as "asc" | "desc" | null}
							sort="price"
						/>
					</div>
				</TableHead>
				<TableHead className="text-muted w-[150px]">
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => handleSort("vrm")}
						onKeyDown={() => handleSort("vrm")}
					>
						VRM
						<SortIcon<CarKeys>
							currentSort={sort}
							currentOrder={order as "asc" | "desc" | null}
							sort="vrm"
						/>
					</div>
				</TableHead>
				<TableHead className="text-muted w-[150px]">
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => handleSort("colour")}
						onKeyDown={() => handleSort("colour")}
					>
						Colour
						<SortIcon<CarKeys>
							currentSort={sort}
							currentOrder={order as "asc" | "desc" | null}
							sort="colour"
						/>
					</div>
				</TableHead>
				<TableHead className="text-muted">
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => handleSort("status")}
						onKeyDown={() => handleSort("status")}
					>
						Status
						<SortIcon<CarKeys>
							currentSort={sort}
							currentOrder={order as "asc" | "desc" | null}
							sort="status"
						/>
					</div>
				</TableHead>
				<TableHead className="text-muted hidden md:table-cell">
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => handleSort("createdAt")}
						onKeyDown={() => handleSort("createdAt")}
					>
						Date Created
						<SortIcon<CarKeys>
							currentSort={sort}
							currentOrder={order as "asc" | "desc" | null}
							sort="createdAt"
						/>
					</div>
				</TableHead>
				<TableHead className="text-muted">
					<div
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => handleSort("views")}
						onKeyDown={() => handleSort("views")}
					>
						Views
						<SortIcon<CarKeys>
							currentSort={sort}
							currentOrder={order as "asc" | "desc" | null}
							sort="views"
						/>
					</div>
				</TableHead>
				<TableHead className="text-muted w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CarTableHeader;
