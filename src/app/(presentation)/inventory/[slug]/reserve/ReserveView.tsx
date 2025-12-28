'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

import FormHeader from "@/components/reserve/FormHeader";
import { Prisma } from "@prisma/client";
import { generataTimeOptions, formatDate } from "@/lib/utils";
import { createCustomerAction } from "@/app/_actions/customer";
import { routes } from "@/config/routes";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { setIsLoading } from "@/hooks/use-loading";
import { useEffect } from "react";

// 1. Combine Schemas
const reservationSchema = z.object({
  handoverDate: z.date({ required_error: "A date is required." }),
  handoverTime: z.string({ message: "Handover time is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "A valid email is required" }),
  mobile: z.string().min(1, { message: "Mobile number is required" }),
  terms: z.enum(["true"], { message: "You must agree to the terms" }),
});
type ReservationSchemaType = z.infer<typeof reservationSchema>;

type ReserveViewProps = {
  car: Prisma.ClassifiedGetPayload<{ include: { make: true } }>;
};

const ReserveView = ({ car }: ReserveViewProps) => {
  const t = useTranslations("Reserve.view");
  const tReserve = useTranslations("Reserve.submitDetails");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLoading(isPending, "reservation-submit");
    return () => setIsLoading(false, "reservation-submit");
  }, [isPending]);

  const form = useForm<ReservationSchemaType>({
    resolver: zodResolver(reservationSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      terms: undefined,
    },
  });

  const onSubmit: SubmitHandler<ReservationSchemaType> = async (data) => {
    startTransition(async () => {
      const date = formatDate(data.handoverDate.toISOString(), data.handoverTime);
      
      const result = await createCustomerAction({
        slug: car.slug,
        date,
        ...data,
      });

      if (!result.success) {
        toast.error(t("error"), { description: result.message, duration: 3000 });
        return;
      }

      toast.success(t("success"), { 
        description: t("successDesc"),
        duration: 2000,
      });

      setTimeout(() => {
        router.push(routes.reserveSuccess(car.slug));
      }, 2000);
    });
  };

  return (
    <div className="space-y-8">
      <FormHeader {...car} />

      <div id="reservation-form" className="mx-auto bg-gray-900/70 rounded-lg shadow-lg text-gray-300 border border-gray-700 p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Date and Time Selection */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white text-center">{t("step1Title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="handoverDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{t("dateLabel")}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>{t("pickDate")}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="handoverTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("timeLabel")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("timeLabel")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {generataTimeOptions().map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-700" />

            {/* User Details */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white text-center">{t("step2Title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tReserve("firstNameLabel")}</FormLabel>
                            <FormControl><Input placeholder={tReserve("firstNamePlaceholder")} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tReserve("lastNameLabel")}</FormLabel>
                            <FormControl><Input placeholder={tReserve("lastNamePlaceholder")} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tReserve("emailLabel")}</FormLabel>
                            <FormControl><Input type="email" placeholder={tReserve("emailPlaceholder")} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tReserve("mobileLabel")}</FormLabel>
                            <FormControl><Input placeholder={tReserve("mobilePlaceholder")} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 p-4">
                  <FormControl>
                    <Checkbox 
                        checked={field.value === 'true'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'true' : 'false')} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{tReserve("terms")}</FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" disabled={isPending} className="w-full font-bold text-lg py-6 bg-green-600 hover:bg-green-700">
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : t("submit")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ReserveView;
