import { EndButtons } from "@/components/shared/end-buttons";
import { CircleCheck } from "lucide-react";
import React from "react";

const ReserveSuccessPage = () => {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <CircleCheck className="mx-auto w-16 h-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Booking confirmed</h1>
        <p className="mt-4 text-muted-foreground">Thanks for your reservation, we will see you soon</p>
        <EndButtons />
      </div>
    </div>
  );
};

export default ReserveSuccessPage;
