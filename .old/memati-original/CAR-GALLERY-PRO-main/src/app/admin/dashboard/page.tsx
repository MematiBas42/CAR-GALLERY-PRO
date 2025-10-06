import { prisma } from "@/lib/prisma";
import { calculatePercentageChange } from "@/lib/utils";
import { ClassifiedStatus, CustomerStatus } from "@prisma/client";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import React from "react";
import KPIcards from "../../../components/admin/dashboard/kpi-cards";
import SalesChart from "@/components/admin/dashboard/sales-chart";
async function getDashBoardData() {
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));

  const lastMonthPromises = {
    carSoldThisMonth: prisma.classified.count({
      where: {
        status: ClassifiedStatus.SOLD,
        updatedAt: {
          gte: startOfThisMonth,
          lte: endOfThisMonth,
        },
      },
    }),
    carSoldLastMonth: prisma.classified.count({
      where: {
        status: ClassifiedStatus.SOLD,
        updatedAt: {
          gte: startOfLastMonth,
          lt: startOfThisMonth,
        },
      },
    }),
    newCustomersThisMonth: prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfThisMonth,
          lte: endOfThisMonth,
        },
      },
    }),
    newCustomersLastMonth: prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfThisMonth,
        },
      },
    }),
    purchasedCustomersThisMonth: prisma.customer.count({
      where: {
        status: CustomerStatus.PURCHASED,
        updatedAt: {
          gte: startOfThisMonth,
          lte: endOfThisMonth,
        },
      },
    }),
    purchasedCustomersLastMonth: prisma.customer.count({
      where: {
        status: CustomerStatus.PURCHASED,
        updatedAt: {
          gte: startOfLastMonth,
          lt: startOfThisMonth,
        },
      },
    }),
  };
  const totalSalesThisMonth =  prisma.classified.aggregate({
    _sum: {
      price: true,
    },
    where: {
      status: ClassifiedStatus.SOLD,
      updatedAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  })
  const totalSalesPreviousMonth = prisma.classified.aggregate({
		where: {
			status: ClassifiedStatus.SOLD,
			updatedAt: {
				gte: startOfLastMonth,
				lt: startOfThisMonth,
			},
		},
		_sum: { price: true },
	});
  const [
    carSoldThisMonth,
    carSoldLastMonth,
    newCustomersThisMonth,
    newCustomersLastMonth,
    purchasedCustomersThisMonth,
    purchasedCustomersLastMonth,
  ] = await Promise.all(Object.values(lastMonthPromises));

  const [salesThisMonth, salesPreviousMonth] = await Promise.all([
		totalSalesThisMonth,
		totalSalesPreviousMonth,
	]);

  const conversionRate =
		newCustomersThisMonth > 0
			? purchasedCustomersThisMonth / newCustomersThisMonth
			: 0;

	const previousConversionRate =
		newCustomersLastMonth > 0
			? purchasedCustomersLastMonth / newCustomersLastMonth
			: 0;

	const totalSales = salesThisMonth._sum.price || 0;
	const previousTotalSales = salesPreviousMonth._sum.price || 0;

	console.log({ totalSales, previousTotalSales });
  const conversionRatePercentageChange = calculatePercentageChange(
		conversionRate,
		previousConversionRate,
	);

	const salesPercentageChange = calculatePercentageChange(
		totalSales,
		previousTotalSales,
	);


  const carSoldPercentageChange = calculatePercentageChange(
    carSoldThisMonth,
    carSoldLastMonth
  );
  const newCustomerPercentageChange = calculatePercentageChange(
    newCustomersThisMonth,
    newCustomersLastMonth
  );
  const purchasedCustomerPercentageChange = calculatePercentageChange(
    purchasedCustomersThisMonth,
    purchasedCustomersLastMonth
  );
  return {
    totalSales,
		carSoldThisMonth,
		newCustomersThisMonth,
		conversionRate,
		conversionRatePercentageChange,
		salesPercentageChange,
		carSoldPercentageChange,
		newCustomerPercentageChange,
  }
}
interface ChartData {
  month: string;
  sales: number;
}

async function getChartData(): Promise<ChartData[]> {
  const now = new Date();
  const monthsData = [] 
  for (let i = 0; i < 12; i++) {
    const startDate = startOfMonth(subMonths(now, i));
    const enddate = endOfMonth(startDate);
    const monthlySales = await prisma.classified.aggregate({
      where: {
        status: ClassifiedStatus.SOLD,
        updatedAt: {
          gte: startDate,
          lte: enddate,
        },
      },
      _sum: {
        price: true,
      },
    })
    monthsData.unshift({
      month: format(startDate, "MMM"),
      sales: monthlySales._sum.price || 0,
    })
  }

  return monthsData;
}


export type DashboardData = ReturnType<typeof getDashBoardData>;
export type ChartDataType = ReturnType<typeof getChartData>;
const AdminDashboard = async () => {
  const dashboarddata =  getDashBoardData();
  const chartData = getChartData();
  return(
    <>
    <KPIcards
      data ={dashboarddata}
    />
    <SalesChart 
      data={chartData}
      
    />
    </>
  );
};

export default AdminDashboard;
