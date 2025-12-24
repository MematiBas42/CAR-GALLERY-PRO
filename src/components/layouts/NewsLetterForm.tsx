"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscribeSchema, SubscribeSchemaType } from "@/app/schemas/sub.schema";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { subscribeAction } from "@/app/_actions/subscribe";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const NewsLetterForm = () => {
  const t = useTranslations("Newsletter");
  const [isPending, startTransition] = useTransition();
  const form = useForm<SubscribeSchemaType>({
    resolver: zodResolver(SubscribeSchema),
    defaultValues: {
      email: "",
      firstName: "Subscriber", // Defaulting as form only has email input in UI
      lastName: "User",
    },
  });

  const onSubmit = (data: SubscribeSchemaType) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      
      const response = await subscribeAction({ success: false, message: "" }, formData);
      if (response.success) {
        toast.success(t("success"), {
          description: response.message,
        });
        form.reset();
      } else {
        toast.error(t("error"), {
          description: response.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-md items-center space-x-2"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input
                  suppressHydrationWarning
                  type="email"
                  placeholder={t("placeholder")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" variant="default" disabled={isPending}>
          {isPending ? t("subscribing") : t("subscribe")}
        </Button>
      </form>
    </Form>
  );
};

export default NewsLetterForm;