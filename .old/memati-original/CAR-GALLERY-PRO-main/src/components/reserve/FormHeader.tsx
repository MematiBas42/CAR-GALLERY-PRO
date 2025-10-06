"use client";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import React, { Suspense }  from "react";

const FormHeaderContent = () => {
  const params = useSearchParams();
  const steps = [
    { id: "1", label: "Welcome", value: 1 },
    { id: "2", label: "Select Date", value: 2 },
    { id: "3", label: "Submit Details", value: 3 },
  ];
  return (
    <div className="flex justify-between bg-primary p-4 shadow-lg">
      <div className="flex flex-col justify-between flex-1">
        <h1 className="text-3xl font-bold text-white">
          {steps.find(({ id }) => params.get("step") === id)?.label}
        </h1>
      </div>
      <div
        className="flex items-center justify-end gap-2 text-sm font-medium
      text-muted-foreground flex-1"
      >
        {steps.map((step) => (
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              params.get("step") === step.id
                ? "bg-white text-muted-foreground"
                : "bg-primary text-primary-foreground"
            )}
            key={step.id}
          >
            {step.id}
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading fallback component
const FormHeaderSkeleton = () => (
  <div className="flex justify-between bg-primary p-4 shadow-lg">
    <div className="flex flex-col justify-between flex-1">
      <div className="h-8 bg-white/20 rounded animate-pulse w-32"></div>
    </div>
    <div className="flex items-center justify-end gap-2 flex-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full bg-white/20 animate-pulse"
        ></div>
      ))}
    </div>
  </div>
);

// Main component wrapped with Suspense
const FormHeader = () => {
  return (
    <Suspense fallback={<FormHeaderSkeleton />}>
      <FormHeaderContent />
    </Suspense>
  );
};

export default FormHeader;


