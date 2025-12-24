import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageProps } from "@/config/types";
import ReserveView from "./ReserveView";

const ReservePage = async (props: PageProps) => {
  const params = await props.params;
  const { slug } = (params as any);

  const car = await prisma.classified.findUnique({
    where: { slug },
    include: { make: true },
  });

  if (!car) {
    return notFound();
  }

  return <ReserveView car={car} />;
};

export default ReservePage;