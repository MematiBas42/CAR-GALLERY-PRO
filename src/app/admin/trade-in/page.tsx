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
import CustomPagination from "@/components/shared/custom-pagination";
import { TradeInRow } from "@/components/admin/trade-in-row";

export default async function TradeInAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const pageSize = 10;
    
    const [requests, totalCount] = await Promise.all([
        prisma.tradeInRequest.findMany({
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.tradeInRequest.count()
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Trade-In Requests</h1>
                <Badge variant="outline" className="text-sm px-3 py-1">Total: {totalCount}</Badge>
            </div>

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>VIN</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Offered Price</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!requests || requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TradeInRow key={req.id} req={req} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex justify-end">
                <CustomPagination 
                    baseURL="/admin/trade-in" 
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
