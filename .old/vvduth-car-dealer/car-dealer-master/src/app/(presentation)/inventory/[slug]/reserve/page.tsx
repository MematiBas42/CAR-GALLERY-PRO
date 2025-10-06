import { MultiStepFormSchema } from "@/app/schemas/form.schema";
import SelectDate from "@/components/reserve/SelectDate";
import SubmitDetails from "@/components/reserve/SubmitDetails";
import Welcome from "@/components/reserve/Welcome";
import { MultiStepFormEnum, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import React from "react";

const MAP_STEP_TO_COMPONENT = {
  [MultiStepFormEnum.WELCOME]: Welcome ,
  [MultiStepFormEnum.SELECT_DATE]: SelectDate,
  [MultiStepFormEnum.SUBMIT_DETAILS]: SubmitDetails,
};

const ReservePage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const slug = params?.slug
  const step = searchParams?.step;

  const { data, success, error } = MultiStepFormSchema.safeParse({
    slug,
    step: Number(step),
  });

  if (!success) {
    console.error("Invalid data:", error);
    notFound();
  }

  const car = await prisma.classified.findUnique({
    where: {
      slug: data.slug,
    },
    include: {
      make: true,
    },
  });

  if (!car) {
    notFound();
  }

  const Component = MAP_STEP_TO_COMPONENT[data.step];
  return <Component searchParams={searchParams} car={car} 
    params={params} 
  />;
};

export default ReservePage;
