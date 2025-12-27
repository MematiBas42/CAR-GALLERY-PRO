"use client";
import {
  MultiStepFormEnum,
  MultiStepsFormComponentProps,
} from "@/config/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { routes } from "@/config/routes";
import { generataTimeOptions, generateDateOptions } from "@/lib/utils";
import { useTranslations } from "next-intl";

const createSelectDateSchema = (t: any) => z.object({
  handoverDate: z.string({
    required_error: t("dateRequired"),
  }),
  handoverTime: z.string({
    required_error: t("timeRequired"),
  }),
});

type SelectDateType = z.infer<ReturnType<typeof createSelectDateSchema>>;

const SelectDate = (props: MultiStepsFormComponentProps) => {
  const t = useTranslations("Reserve.selectDate");
  const tErrors = useTranslations("Reserve.selectDate.errors");
  
  const { searchParams } = props;
  const handoverDate = (searchParams?.handoverDate as string) || undefined;
  const handoverTime = (searchParams?.handoverTime as string) || undefined;
  
  const form = useForm<SelectDateType>({
    resolver: zodResolver(createSelectDateSchema(tErrors)),
    mode: "onBlur",
    defaultValues: {
      handoverDate: handoverDate
        ? decodeURIComponent(handoverDate)
        : handoverDate, 
      handoverTime: handoverTime
        ? decodeURIComponent(handoverTime)
        : handoverTime, 
    },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPreviousPending, startPreviousTransition] = useTransition();

  const prevStep = () => {
    startPreviousTransition(async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("step", MultiStepFormEnum.WELCOME.toString());
      router.push(url.toString());
    });
  };

  const onSelectDate: SubmitHandler<SelectDateType> = async (data) => {
    startTransition(async () => {
      const valid = await form.trigger();
      if (!valid) return;

      const url = new URL(
        routes.reserve(props.car.slug, MultiStepFormEnum.SUBMIT_DETAILS),
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      );
      url.searchParams.set(
        "handoverDate",
        encodeURIComponent(data.handoverDate)
      );
      url.searchParams.set(
        "handoverTime",
        encodeURIComponent(data.handoverTime)
      );
      router.push(url.toString());
    });
  };

  return (
    <Form {...form}>
      <form
        className="mx-auto bg-white flex flex-col rounded-b-lg shadow-lg p-6 h-96"
        onSubmit={form.handleSubmit(onSelectDate)}
      >
        <div className="space-y-6 flex-1">
          <FormField
            control={form.control}
            name="handoverDate"
            render={({ field: { ref, ...rest } }) => (
              <FormItem>
                <FormLabel htmlFor="handoverDate" className="text-gray-700">
                  {t("dateLabel")}
                </FormLabel>
                <FormControl>
                  <Select options={generateDateOptions()} {...rest} className="text-gray-900 border-gray-300" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="handoverTime"
            render={({ field: { ref, ...rest } }) => (
              <FormItem>
                <FormLabel htmlFor="handoverTime" className="text-gray-700">
                  {t("timeLabel")}
                </FormLabel>
                <FormControl>
                  <Select options={generataTimeOptions()} {...rest} className="text-gray-900 border-gray-300" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isPreviousPending}
            className="uppercase font-bold flex gap-x-3 w-full flex-1 border-gray-300 text-gray-700"
          >
            {isPreviousPending && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
            {t("back")}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="uppercase font-bold flex gap-x-3 w-full flex-1"
          >
            {isPending && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
            {t("continue")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SelectDate;