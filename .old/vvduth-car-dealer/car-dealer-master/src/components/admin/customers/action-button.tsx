"use client";

import type { CustomerWithCar } from "@/config/types";

import { EyeIcon, Loader2, PencilIcon, Trash } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Tooltip } from "react-tooltip";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { deleteCustomerAction } from '@/app/_actions/customer';
import { toast } from "sonner";

export const CustomerActionButtons = ({
	customer,
}: { customer: CustomerWithCar }) => {
	const [isPending, startTransition] = useTransition();
	const deleteCustomer = (id: number) => {
		startTransition(async () => {
			const result = await deleteCustomerAction(id);
			if (result.success) {
				toast.success("Customer deleted successfully", {
                    description: result.message,
                })
			} else {
				toast.error("Failed to delete customer", {
                    description: result.message,
                })
			}
		});
	};

	return (
		<>
			<Button
				variant="destructive"
				className="p-2 h-fit"
				data-tooltip-id="trash-tooltip"
				data-tooltip-content="Delete"
				onClick={() => deleteCustomer(customer.id)}
			>
				<Tooltip id="trash-tooltip" />
				{isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Trash className="h-4 w-4 outline-none" />
				)}
			</Button>
			<Button
				data-tooltip-id="edit-tooltip"
				data-tooltip-content="Edit"
				className="p-2 h-fit"
				asChild
			>
				<Link href={routes.admin.editCustomer(customer.id)}>
					<Tooltip id="edit-tooltip" />
					<PencilIcon className="h-4 w-4 outline-none" />
				</Link>
			</Button>
		</>
	);
};