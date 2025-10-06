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

const EditCustomerForm = ({ customer }: { customer: Customer }) => {
  const form = useForm<EditCustomerType>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      status: customer.status,
    },
  });
  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<EditCustomerType> = async (data) => {
    startTransition(async () => {
      const response = await updateCustomerAction({
        id: customer.id,
        status: data.status,
      });
      if (response.success) {
        toast.success("Customer status updated successfully", {
          description: response.message,
          duration: 3000,
        });
      } else {
        toast.error("Error updating customer status", {
          description: response.message,
          duration: 3000,
        });
      }
    });
  };
  return (
    <Form {...form}>
      <form action="" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="status"
          render={({ field: { ref, ...rest } }) => (
            <FormItem>
              <FormLabel htmlFor="status">Customer Status</FormLabel>
              <FormControl>
                <Select
                  options={Object.values(CustomerStatus).map((value) => ({
                    label: formatCustomerStatus(value),
                    value,
                  }))}
                  noDefault={false}
                  selectClassName="bg-primary-800 border-transparent text-muted/75"
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant={"secondary"} type="submit" className="text-white mt-2">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Update Status"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EditCustomerForm;
