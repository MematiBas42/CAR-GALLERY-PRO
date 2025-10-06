
import EditCustomerForm from "@/components/admin/customers/EditCustomerForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerBadgeMap } from "@/config/constants";
import { routes } from "@/config/routes";
import { PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { formatCustomerStatus } from "@/lib/utils";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import React from "react";
import { z } from "zod";

const EditCusomterPage = async (props: PageProps) => {
  const params = await props.params;
  const { data, success } = z
    .object({
      id: z.number(),
    })
    .safeParse({
      id: Number(params?.id),
    });
  if (!success || !data.id) {
    redirect(routes.admin.customers);
  }
  const customer = await prisma.customer.findUnique({
    where: {
      id: data.id,
    },
    include: {
      classified: true,
      lifecycle: true,
    },
  });

  if (!customer) {
    redirect(routes.admin.customers);
  }
  return (
    <>
      <div className="flex-col flex p-6 text-muted space-y-4 container">
        <div className="flex justify-between">
          <h1 className="font-bold text-lg md:text-2xl">Edit customer</h1>
          <EditCustomerForm customer={customer} />
        </div>
      </div>
      <div className="container p-4 space-y-6">
        <div className="grid grid-cols-2 space-x-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">
                Personal information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-background">
              <div>
                <strong>Name:</strong>
                {customer.firstName} {customer.lastName}
              </div>
              <div>
                <strong>Email:</strong> {customer.email}
              </div>
              <div>
                <strong>Phone:</strong> {customer.mobile}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Customer Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-background">
              <div>
                <strong>Status:</strong>
                <Badge
                  className="text-background ml-2"
                  variant={CustomerBadgeMap[customer.status]}
                >
                  {formatCustomerStatus(customer.status)}
                </Badge>
              </div>
              <div>
                <strong>Terms accepted:</strong>{" "}
                {customer.termsAccepted ? "Yes" : "No"}
              </div>
              <div>
                <strong>Booking Date:</strong>{" "}
                {customer.bookingDate
                  ? format(customer.bookingDate, "do MMM yyy HH:mm")
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-muted">
            <div>
              <strong>Customer ID:</strong> {customer.id}
            </div>
            <div>
              <strong>Car Title:</strong> {customer.classified?.title}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {format(customer.createdAt, "do MMM yyy HH:mm")}
            </div>
            <div>
              <strong>Last Updated:</strong>{" "}
              {format(customer.updatedAt, "do MMM yyy HH:mm")}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Customer Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-muted">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted font-semibold text-base">
                    Date
                  </TableHead>
                  <TableHead className="text-muted font-semibold text-base">
                    Old Status
                  </TableHead>
                  <TableHead className="text-muted font-semibold text-base">
                    New Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.lifecycle.map((entry) => (
                  <TableRow className="text-muted/75" key={entry.id}>
                    <TableCell>
                      {format(entry.updatedAt, "do MMM yyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {formatCustomerStatus(entry.oldStatus)}
                    </TableCell>
                    <TableCell>
                      {formatCustomerStatus(entry.newStatus)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditCusomterPage;
