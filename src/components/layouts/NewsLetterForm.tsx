"use client";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscribeSchema, SubscribeSchemaType } from "@/app/schemas/sub.schema";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { subscribeAction } from "@/app/_actions/subscribe";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { setIsLoading } from "@/hooks/use-loading";

const NewsLetterForm = () => {
  const t = useTranslations("Newsletter");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsLoading(isPending, "newsletter-sub");
    return () => setIsLoading(false, "newsletter-sub");
  }, [isPending]);

  const form = useForm<SubscribeSchemaType>({
    resolver: zodResolver(SubscribeSchema),
    defaultValues: {
      email: "",
      firstName: "Subscriber", 
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

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
      return (
          <div className="flex w-full max-w-md items-center space-x-2 opacity-0">
              <div className="h-10 w-full bg-gray-800 rounded-md"></div>
              <div className="h-10 w-24 bg-primary rounded-md"></div>
          </div>
      );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-md items-center space-x-2"
        suppressHydrationWarning={true}
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
