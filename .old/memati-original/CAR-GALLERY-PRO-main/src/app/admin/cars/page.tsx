import { validatePagination } from "@/app/schemas/pagination.schema";
import { AdminCarFilterSchema } from "@/app/schemas/table-filter.schema";
import {
  CarsTableSortSchema,
  CarsTableSortType,
  validateSortOrder,
} from "@/app/schemas/table-sort.schema";
import CarManageHeader from "@/components/admin/cars/cars-header";
import CarsTableRow from "@/components/car/car-table-row";
import CarTableHeader from "@/components/car/CarTableHeader";
import { AdminTableFooter } from "@/components/shared/admin-table-footer";
import { Table, TableBody } from "@/components/ui/table";
import { routes } from "@/config/routes";
import { CarKeys, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import React from "react";

const CarsPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const { page, itemsPerPage } = validatePagination({
    page: (searchParams?.page as string) || "1",
    itemsPerPage: (searchParams?.itemsPerPage as "10") || "10",
  });

  const { sort, order } = validateSortOrder<CarsTableSortType>({
    sort: searchParams?.sort as string as CarKeys,
    order: (searchParams?.order as string as "asc") || "desc",
    schema: CarsTableSortSchema,
  });
  const offset = (Number(page) - 1) * Number(itemsPerPage);
  const { data, error } = AdminCarFilterSchema.safeParse(searchParams);

  if (error) {
    console.error("Validation error: ", error);
  }

  const cars = await prisma.classified.findMany({
    where: {
      ...(data?.q && {
        title: {
          contains: data.q,
          mode: "insensitive",
        },
      }),
      ...(data?.status &&
        data.status !== "ALL" && {
          status: data.status,
        }),
    },
    orderBy: { [sort as string]: order as "asc" | "desc" },
    include: {images: {
      take: 1
    }},
    skip: offset,
    take: Number(itemsPerPage),
  });

  const count = await prisma.classified.count({
     where: {
      ...(data?.q && {
        title: {
          contains: data.q,
          mode: "insensitive",
        },
      }),
      ...(data?.status &&
        data.status !== "ALL" && {
          status: data.status,
        }),
    },
  })

  const totalPages = Math.ceil(count / Number(itemsPerPage));
  return (
    <>
      <CarManageHeader searchParams={searchParams} />
      <Table>
        <CarTableHeader
          sort={sort as CarKeys}
          order={order as "asc" | "desc"}
          
        />
        <TableBody>
          {cars.map((car) => (
            <CarsTableRow 
              key={car.id}
              car={car}/>
          ))}
        </TableBody>
        <AdminTableFooter
          disabled={cars.length === 0}
          searchParams={searchParams}
          totalPages={totalPages}
          baseURL={routes.admin.cars}
          cols={9}
        />
      </Table>
    </>
  );
};

export default CarsPage;
