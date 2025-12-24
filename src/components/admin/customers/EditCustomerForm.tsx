'use client';
import React, { useEffect, useTransition } from "react";
import {
  editCustomerSchema,
  type EditCustomerType,
} from "@/app/schemas/customer.schema";
import { Customer, CustomerStatus } from "@prisma/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManualCustomerAction, updateCustomerAction } from "@/app/_actions/customer";
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
import { useTranslations } from "next-intl";

// Make the customer prop optional
type EditCustomerFormProps = {
    customer?: Customer & { classified: { title: string } | null };
}

const EditCustomerForm = ({ customer }: EditCustomerFormProps) => {
  const t = useTranslations("Admin.customers.form");
  const tEnums = useTranslations("Enums");
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!customer;

  const form = useForm<EditCustomerType>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      mobile: customer?.mobile || "",
      status: customer?.status || CustomerStatus.INTERESTED,
      carTitle: customer?.carTitle || customer?.classified?.title || "",
      notes: customer?.notes || "",
      bookingDate: customer?.bookingDate || undefined,
    },
  });

  // This effect should only run in edit mode
  useEffect(() => {
    if (isEditMode) {
        form.reset({
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
            mobile: customer.mobile || "",
            status: customer.status,
            carTitle: customer.carTitle || customer.classified?.title || "",
            notes: customer.notes || "",
            bookingDate: customer.bookingDate || undefined,
        });
    }
  }, [customer, isEditMode, form.reset]);

  const onSubmit: SubmitHandler<EditCustomerType> = async (data) => {
    startTransition(async () => {
        if (isEditMode) {
            const response = await updateCustomerAction({ id: customer.id, ...data });
            if (response.success) {
                toast.success(t("successUpdated"));
            } else {
                toast.error(t("errorUpdating"), { description: response.message });
            }
        } else {
            const response = await createManualCustomerAction(data);
            if (response && !response.success) {
                 toast.error(t("errorCreating"), { description: response.message });
            }
            // On success, the action redirects, so no toast is needed here.
        }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6 text-white" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Column 1 */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("lastName")}</FormLabel>
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
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("mobile")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="carTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("carTitle")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookingDate")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
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
                  <FormLabel>{t("notes")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("notesPlaceholder")} className="bg-transparent text-white" rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("status")}</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      options={Object.values(CustomerStatus).map((value) => ({
                        label: tEnums(`CustomerStatus.${value}`),
                        value,
                      }))}
                      noDefault={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
          <Button type="submit" className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isEditMode ? t("updateButton") : t("createButton")
            )}
          </Button>
      </form>
    </Form>
  );

};

export default EditCustomerForm;