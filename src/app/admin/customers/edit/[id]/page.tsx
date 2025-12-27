import EditCustomerForm from "@/components/admin/customers/EditCustomerForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { formatCustomerStatus, formatSimpleDate, getImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { EyeIcon, PencilIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";

const EditCustomerPage = async (props: PageProps) => {
  const params = await props.params;
  const { data, success } = z
    .object({
      id: z.number(),
    })
    .safeParse({
      id: Number((params as any)?.id),
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
      favorites: {
        include: {
          images: { take: 1 }
        }
      },
      lifecycle: {
        include: {
          updatedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    redirect(routes.admin.customers);
  }
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl">Customer Details</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-7xl bg-gray-950 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Edit Customer Details</DialogTitle>
            </DialogHeader>
            <div className="py-4 overflow-y-auto">
              <EditCustomerForm customer={customer as any} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-background">
               <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-white">{`${customer.firstName} ${customer.lastName}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-white">{customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-medium text-white">{customer.mobile || "-"}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Status & Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-background">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={CustomerBadgeMap[customer.status]}>
                  {formatCustomerStatus(customer.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Date</span>
                <span className="font-medium text-white">{customer.bookingDate ? formatSimpleDate(customer.bookingDate) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Terms Accepted</span>
                <span className="font-medium text-white">{customer.termsAccepted ? "Yes" : "No"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer ID</span>
              <span className="font-medium text-white">{customer.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interested In (Main)</span>
              <span className="font-medium text-white text-right">{customer.carTitle || customer.classified?.title || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium text-white">{format(customer.createdAt, "do MMM yyy HH:mm")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium text-white">{format(customer.updatedAt, "do MMM yyy HH:mm")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="bg-gray-900/50 border-b border-gray-700/50">
            <CardTitle className="text-gray-100 flex items-center gap-2">
               <EyeIcon className="w-5 h-5 text-blue-500" />
               Favorited Vehicles 
               <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">
                 {customer.favorites.length}
               </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {customer.favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customer.favorites.map((fav) => (
                  <Link href={`/inventory/${fav.slug}`} key={fav.id} target="_blank" className="group">
                    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-md hover:shadow-blue-500/10">
                      <div className="relative h-32 w-full">
                        {fav.images && fav.images[0] ? (
                          <Image
                            src={getImageUrl(fav.images[0].src)}
                            alt={fav.title || "Car"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-mono border border-white/10">
                          {(fav.price / 100).toLocaleString()} {fav.currency}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-blue-400 transition-colors">
                          {fav.title}
                        </h4>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500 uppercase font-medium">
                          <span>{fav.year}</span>
                          <span className="bg-gray-800 px-1.5 py-0.5 rounded">{fav.odoReading} {fav.odoUnit}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 italic bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
                <p>This customer has no favorite vehicles yet.</p>
                <p className="text-[10px] not-italic mt-1 text-gray-600">Favorites are synced automatically when the customer browses the site.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Customer Lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="w-[50%] text-gray-400">Change</TableHead>
                  <TableHead className="text-gray-400">Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.lifecycle.length > 0 ? (
                  customer.lifecycle.map((entry) => (
                    <TableRow key={entry.id} className="border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <TableCell className="text-gray-300 text-xs">{format(entry.updatedAt, "do MMM yyy HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant={CustomerBadgeMap[entry.newStatus]} className="text-[10px] uppercase font-bold">
                          {formatCustomerStatus(entry.newStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 text-xs">{entry.change}</TableCell>
                      <TableCell className="text-gray-400 text-xs italic">{entry.updatedBy?.email || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500 italic">No lifecycle events found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditCustomerPage;
