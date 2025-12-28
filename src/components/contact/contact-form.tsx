"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, ContactFormType } from "@/app/schemas/contact.schema";
import { sendContactEmail } from "@/app/_actions/contact";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { setIsLoading } from "@/hooks/use-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export const ContactForm = () => {
  const t = useTranslations("Contact.form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(isSubmitting, "contact-form-submit");
    return () => setIsLoading(false, "contact-form-submit");
  }, [isSubmitting]);

  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormType) => {
    setIsSubmitting(true);
    const result = await sendContactEmail(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(t("success"));
      form.reset();
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <div className="bg-background border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">{t("title")}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("email")} {...field} />
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
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("phone")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("message")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("message")}
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? t("sending") : t("submit")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
