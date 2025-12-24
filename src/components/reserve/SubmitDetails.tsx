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
import { SubmitDetailsSchema } from "@/app/schemas/customer.schema";
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
type SubmitdetaiSchemaType = z.infer<typeof SubmitDetailsSchema>;

const SubmitDetails = (props: MultiStepsFormComponentProps) => {
  const t = useTranslations("Reserve.submitDetails");
  const tCommon = useTranslations("Newsletter"); // For Error title
  const { searchParams, params } = props;
  const router = useRouter();
  const form = useForm<SubmitdetaiSchemaType>({
    resolver: zodResolver(SubmitDetailsSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      terms: "false",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [isPrevPending, startPrevTransition] = useTransition();

  const prevStep = () => {
    startPrevTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const url = new URL(window.location.href);
      url.searchParams.set("step", MultiStepFormEnum.SELECT_DATE.toString());
      router.push(url.toString());
    });
  };

  const onSubmitDetails: SubmitHandler<SubmitdetaiSchemaType> = async (
    data
  ) => {
    startTransition(async () => {
      const valid = await form.trigger();
      if (!valid) return;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const handoverDate = decodeURIComponent(
        searchParams?.handoverDate as string
      );
      const handoverTime = decodeURIComponent(
        searchParams?.handoverTime as string
      );
      const date = formatDate(handoverDate, handoverTime);
      
      const {success, message} = await createCustomerAction({
        slug: params?.slug as string,
        date,
        ...data, 
      })

      if (!success) {
        toast.error(tCommon("error"), {
          description: message,
          duration: 1000,
        })
        return;
      }
      toast.success(t("success"), {
        description: t("successDesc"),
        duration: 1000,
      });

      setTimeout(() => {
        router.push(routes.reserveSuccess(params?.slug as string));
      },1000)
    });
  };
  return (
    <Form {...form}>
      <form
        className="mx-auto bg-white flex flex-col rounded-b-lg shadow-lg p-6 h-96"
        onSubmit={form.handleSubmit(onSubmitDetails)}
      >
        <div className="space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="firstName">{t("firstNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("firstNamePlaceholder")} {...field} />
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
                  <FormLabel htmlFor="lastName">{t("lastNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("lastNamePlaceholder")} {...field} />
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
                  <FormLabel htmlFor="email">{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("emailPlaceholder")} {...field} />
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
                  <FormLabel htmlFor="mobile">{t("mobileLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("mobilePlaceholder")} {...field} />
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
              render={({ field: { ref, onChange, ...rest } }) => (
                <FormItem className="flex items-center gap-x-2">
                  <FormControl>
                    <Checkbox
                      className="cursor-pointer m-0"
                      onCheckedChange={(e) => onChange(e ? "true" : "false")}
                      {...rest}
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("terms")}
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-x-4">
          <Button
            type="button"
            onClick={prevStep}
            disabled={isPrevPending}
            className="uppercase font-bold flex gap-x-3 w-full flex-1"
          >
            {isPrevPending ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            ) : null}{" "}
            {t("back")}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="uppercase font-bold flex gap-x-3 w-full flex-1"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            ) : null}{" "}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubmitDetails;
