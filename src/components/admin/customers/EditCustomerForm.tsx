"use client";
import React, { useTransition } from "react";
import {
  editCustomerSchema,
  type EditCustomerType,
} from "@/app/schemas/customer.schema";
import { Customer, CustomerStatus } from "@prisma/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCustomerAction } from "@/app/_actions/customer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { formatCustomerStatus } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EditCustomerForm = ({ customer }: { customer: Customer }) => {
  const form = useForm<EditCustomerType>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      status: customer.status,
      carTitle: customer.carTitle || "",
      notes: customer.notes || "",
    },
  });
  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<EditCustomerType> = async (data) => {
    startTransition(async () => {
      const response = await updateCustomerAction({
        id: customer.id,
        ...data,
      });
      if (response.success) {
        toast.success("Customer updated successfully");
      } else {
        toast.error("Error updating customer", { description: response.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="text-xl font-semibold pt-4">Vehicle & Notes</h2>
        <FormField
          control={form.control}
          name="carTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Car Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 2023 Toyota Camry" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Customer notes..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="text-xl font-semibold pt-4">Status</h2>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Status</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  options={Object.values(CustomerStatus).map((value) => ({
                    label: formatCustomerStatus(value),
                    value,
                  }))}
                  noDefault={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant={"primary"} type="submit" className="w-full mt-4">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Update Customer"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EditCustomerForm;