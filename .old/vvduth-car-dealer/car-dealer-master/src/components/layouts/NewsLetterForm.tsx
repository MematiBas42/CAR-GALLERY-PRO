"use client";
import { subscribeAction } from "@/app/_actions/subscribe";
import React, { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscribeSchema } from "@/app/schemas/sub.schema";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CircleCheckIcon, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

const SubscribeButton = () => {
	const { pending } = useFormStatus();

	return (
		<Button
			disabled={pending}
			type="submit"
			className="w-full uppercase font-bold"
		>
			{pending && (
				<Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
			)}{" "}
			Subscribe Now
		</Button>
	);
};
const NewsLetterForm = () => {
  const [state, formAction, pending] = useActionState(subscribeAction, {
    success: false,
    message: "",
  });

  const form = useForm({
    resolver: zodResolver(SubscribeSchema),
    mode: "onChange",
  });

  const handleFormAction = async (formdata: FormData) => {
    const valid = await form.trigger();
    if (!valid) {
      return;
    }
    formAction(formdata);
  };

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-primary">
        Subcribe to our inevntory updates
      </h3>
      <p className="text-gray-700">
        Enter your details to get new stock updates
      </p>
      <Form {...form}>
        <form
          action={handleFormAction}
          onSubmit={() => null}
          ref={formRef}
          className="space-y-2"
        >
          <div className="grid grid-cols-2 space-x-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="First Name"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Last Name"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
          </div>
          <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      {...field}
                      className="bg-white w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <SubscribeButton />

            {state.success && (
                <div className="flex items-center gap-2 rounded-md bg-green-500
                p-3 text-white">
                    <CircleCheckIcon className="h-5 w-5" />
                    <span>Success! {state.message}</span>
                </div>
            )}

            {!state.success && state.message && (
                <div className="flex items-center gap-2 rounded-md bg-red-500
                p-3 text-white">
                    <CircleCheckIcon className="h-5 w-5" />
                    <span>Error! {state.message}</span>
                </div>
            )}
        </form>
      </Form>
    </div>
  );
};

export default NewsLetterForm;
