"use client";
import {
  MultiStepFormEnum,
  MultiStepsFormComponentProps,
} from "@/config/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { formatDate } from "@/lib/utils";
import { createCustomerAction } from "@/app/_actions/customer";
import { toast } from "sonner";
import { routes } from "@/config/routes";
import { useTranslations } from "next-intl";

const createSubmitDetailsSchema = (t: any) => z.object({
  firstName: z.string().min(1, { message: t("firstNameRequired") }),
  lastName: z.string().min(1, { message: t("lastNameRequired") }),
  email: z.string().email({ message: t("invalidEmail") }),
  mobile: z.string().min(1, { message: t("mobileRequired") }),
  terms: z.enum(["true"], {
    error_map: () => ({ message: t("termsRequired") }),
  }),
});

type SubmitdetaiSchemaType = z.infer<ReturnType<typeof createSubmitDetailsSchema>>;

const SubmitDetails = (props: MultiStepsFormComponentProps) => {
  const t = useTranslations("Reserve.submitDetails");
  const tErrors = useTranslations("Reserve.submitDetails.errors");
  const tCommon = useTranslations("Newsletter");
  
  const { searchParams, params } = props;
  const router = useRouter();
  
  const form = useForm<SubmitdetaiSchemaType>({
    resolver: zodResolver(createSubmitDetailsSchema(tErrors)),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      terms: "false" as any,
    },
  });

  const [isPending, startTransition] = useTransition();
  const [isPrevPending, startPrevTransition] = useTransition();

  const prevStep = () => {
    startPrevTransition(async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("step", MultiStepFormEnum.SELECT_DATE.toString());
      router.push(url.toString());
    });
  };

  const onSubmitDetails: SubmitHandler<SubmitdetaiSchemaType> = async (data) => {
    startTransition(async () => {
      const valid = await form.trigger();
      if (!valid) return;

      const handoverDate = decodeURIComponent(searchParams?.handoverDate as string);
      const handoverTime = decodeURIComponent(searchParams?.handoverTime as string);
      const date = formatDate(handoverDate, handoverTime);
      
      const {success, message} = await createCustomerAction({
        slug: params?.slug as string,
        date,
        ...data, 
        terms: "true"
      });

      if (!success) {
        toast.error(tCommon("error"), {
          description: message,
          duration: 2000,
        })
        return;
      }
      
      toast.success(t("success"), {
        description: t("successDesc"),
        duration: 2000,
      });

      setTimeout(() => {
        router.push(routes.reserveSuccess(params?.slug as string));
      }, 1000);
    });
  };

  return (
    <Form {...form}>
      <form
        className="mx-auto bg-white flex flex-col rounded-b-lg shadow-lg p-6 h-96 overflow-y-auto"
        onSubmit={form.handleSubmit(onSubmitDetails)}
      >
        <div className="space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-900">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("firstNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("firstNamePlaceholder")} {...field} className="text-gray-900 border-gray-300" />
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
                  <FormLabel>{t("lastNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("lastNamePlaceholder")} {...field} className="text-gray-900 border-gray-300" />
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
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("emailPlaceholder")} {...field} className="text-gray-900 border-gray-300" />
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
                  <FormLabel>{t("mobileLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("mobilePlaceholder")} {...field} className="text-gray-900 border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="terms"
              render={({ field: { ref, onChange, value, ...rest } }) => (
                <FormItem className="flex items-center gap-x-2">
                  <FormControl>
                    <Checkbox
                      id="terms"
                      className="cursor-pointer border-gray-300"
                      checked={value === "true"}
                      onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
                      {...rest}
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="terms"
                    className="text-sm font-medium leading-none text-gray-700 cursor-pointer"
                  >
                    {t("terms")}
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isPrevPending}
            className="uppercase font-bold flex gap-x-3 w-full flex-1 border-gray-300 text-gray-700"
          >
            {isPrevPending && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
            {t("back")}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="uppercase font-bold flex gap-x-3 w-full flex-1"
          >
            {isPending && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubmitDetails;