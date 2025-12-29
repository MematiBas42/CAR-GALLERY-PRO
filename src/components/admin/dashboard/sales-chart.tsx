"use client";
import { ChartDataType } from "@/app/admin/dashboard/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import React, { use } from "react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

interface SalesChartsProps {
  data: ChartDataType;
}
const SalesCharts = (props: SalesChartsProps) => {
  const t = useTranslations("Admin.dashboard.salesChart");
  const tMonths = useTranslations("Months");
  const { data } = props;
  const chartData = use(data);

  const translatedData = chartData.map((item) => ({
    ...item,
    month: tMonths(item.month),
  }));

  return (
    <div>
      <Card className="mbb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">
            {t("title", {
              yearStart: new Date().getFullYear() - 1,
              yearEnd: new Date().getFullYear(),
            })}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={translatedData}>
              <XAxis
              dataKey="month"
              stroke="#60a5fa"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              />
              <YAxis
              stroke="#60a5fa"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatPrice({ price: value, currency: "USD" })
              }
              />
              <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
		return (
			<div className="bg-gray-800 border border-gray-700 p-2 rounded">
				<p className="text-gray-100">
					{`${label}: ${formatPrice({ price: payload[0].value as number, currency: "USD" })}`}
				</p>
			</div>
		);
	}
}

export default SalesCharts;
