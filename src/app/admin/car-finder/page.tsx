import { prisma } from "@/lib/prisma";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Mail } from "lucide-react";
import Link from "next/link";

import CustomPagination from "@/components/shared/custom-pagination";

export default async function CarFinderAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const pageSize = 10;
    
    const [requests, totalCount] = await Promise.all([
        prisma.carFinderRequest.findMany({
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.carFinderRequest.count()
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Car Finder Requests</h1>
                <Badge variant="outline" className="text-sm px-3 py-1">Total: {totalCount}</Badge>
            </div>

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-x-auto">
                <Table>
                    {/* ... TableHeader ... */}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Looking For</TableHead>
                            <TableHead>Preferences</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        )}
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                {/* ... existing cells ... */}
                                <TableCell>
                                    <Badge variant={
                                        req.status === 'NEW' ? 'default' :
                                        req.status === 'FOUND' ? 'secondary' : 
                                        'outline'
                                    }>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {req.make} {req.model}
                                </TableCell>
                                <TableCell className="text-sm space-y-1">
                                    <div className="text-xs">
                                        Year: {req.yearMin || 'Any'} - {req.yearMax || 'Any'}
                                    </div>
                                    {(req.color || req.transmission) && (
                                        <div className="flex gap-1 flex-wrap">
                                            {req.color && <Badge variant="outline" className="text-[10px] h-5">{req.color}</Badge>}
                                            {req.transmission && <Badge variant="outline" className="text-[10px] h-5">{req.transmission}</Badge>}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {req.budget || "-"}
                                </TableCell>
                                <TableCell>
                                    {req.firstName} {req.lastName}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex flex-col gap-0.5">
                                        <a href={`mailto:${req.email}`} className="hover:underline flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {req.email}
                                        </a>
                                        <span className="text-muted-foreground">{req.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(req.createdAt, 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end">
                <CustomPagination 
                    baseURL="/admin/car-finder" 
                    totalPages={totalPages} 
                    styles={{
                        paginationRoot: "justify-end",
                        paginationLinkActive: "bg-primary text-primary-foreground"
                    }}
                />
            </div>
        </div>
    );
}
