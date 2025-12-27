import { prisma } from "@/lib/prisma";
import React from "react";
import Image from "next/image";
import { LatestArrivalSwitch } from "@/components/admin/cars/latest-arrival-switch";
import { ClassifiedStatus } from "@prisma/client";

const AdminLatestArrivalsPage = async () => {
  const cars = await prisma.classified.findMany({
    where: { status: ClassifiedStatus.LIVE },
    orderBy: { createdAt: "desc" },
    include: { 
        images: { take: 1 },
        make: true,
        model: true
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-200">Manage Latest Arrivals</h1>
            <p className="text-sm text-slate-400">Select which LIVE vehicles appear in the featured section on the homepage.</p>
        </div>
        <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30 text-sm">
            Total LIVE vehicles: <strong>{cars.length}</strong>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-900/50 text-slate-300 border-b border-gray-700 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold text-center">Featured Status</th>
                </tr>
            </thead>
            <tbody>
                {cars.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="p-12 text-center text-slate-500 italic">
                            No live vehicles found. Add some cars first!
                        </td>
                    </tr>
                ) : (
                    cars.map((car) => (
                    <tr key={car.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors group">
                        <td className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="relative h-12 w-20 rounded shadow-md overflow-hidden bg-gray-900 border border-gray-700">
                                {car.images[0] ? (
                                    <Image src={car.images[0].src} alt={car.title || ""} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] text-gray-600 italic">No image</div>
                                )}
                            </div>
                            <div>
                                <div className="text-slate-200 font-medium group-hover:text-white transition-colors">{car.title}</div>
                                <div className="text-[10px] font-mono text-slate-500 uppercase">{car.vrm}</div>
                            </div>
                        </div>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">
                            ${(car.price / 100).toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                        <div className="flex justify-center">
                            <LatestArrivalSwitch id={car.id} initialValue={car.isLatestArrival} />
                        </div>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLatestArrivalsPage;
