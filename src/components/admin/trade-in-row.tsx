"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/currency";
import { Eye, Trash2, Loader2, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { deleteTradeInRequest, updateTradeInOffer } from "@/app/_actions/trade-in";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface TradeInRowProps {
    req: any; // Using any for simplicity with Prisma generated types passed from server
}

export const TradeInRow = ({ req }: TradeInRowProps) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Offer Form States
    const [price, setPrice] = useState(req.offeredPrice || "");
    const [date, setDate] = useState<Date | undefined>(req.offerExpiresAt ? new Date(req.offerExpiresAt) : undefined);
    const [notes, setNotes] = useState(req.adminNotes || "");

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this request?")) return;
        
        setLoading(true);
        const res = await deleteTradeInRequest(req.id);
        setLoading(false);
        
        if (res.success) {
            toast.success("Request deleted");
        } else {
            toast.error("Failed to delete");
        }
    };

    const handleUpdateOffer = async () => {
        if (!price) {
            toast.error("Please enter a price");
            return;
        }

        setLoading(true);
        const res = await updateTradeInOffer(req.id, {
            price: Number(price),
            expiresAt: date,
            notes: notes
        });
        setLoading(false);

        if (res.success) {
            toast.success("Offer updated & email sent!");
            setIsDetailsOpen(false);
        } else {
            toast.error("Failed to update offer");
        }
    };

    return (
        <TableRow>
            <TableCell>
                <Badge variant={
                    req.status === 'PENDING' ? 'outline' :
                    req.status === 'OFFERED' ? 'default' : 
                    req.status === 'REJECTED' || req.status === 'EXPIRED' ? 'destructive' : 
                    'secondary'
                }>
                    {req.status}
                </Badge>
            </TableCell>
            <TableCell className="font-medium">
                {req.year} {req.make} {req.model}
                {req.trim && <span className="block text-xs text-muted-foreground">{req.trim}</span>}
                <span className="block text-xs text-muted-foreground">{req.mileage ? `${req.mileage.toLocaleString()} mi` : 'No mileage'}</span>
            </TableCell>
            <TableCell className="font-mono text-xs">{req.vin}</TableCell>
            <TableCell>
                {req.firstName} {req.lastName}
            </TableCell>
            <TableCell className="text-sm">
                <div className="flex flex-col gap-0.5">
                    <a href={`mailto:${req.email}`} className="hover:underline">{req.email}</a>
                    <span className="text-muted-foreground">{req.phone}</span>
                </div>
            </TableCell>
            <TableCell>
                {req.offeredPrice ? (
                    <span className="font-bold text-green-600">
                        {formatCurrency(req.offeredPrice)}
                    </span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
                {format(new Date(req.createdAt), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    {/* DETAILS & OFFER MODAL */}
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Trade-In Details & Offer</DialogTitle>
                                <DialogDescription>Review vehicle details and send an offer to the customer.</DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-4">
                                <div className="space-y-3 md:space-y-4">
                                    <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider border-b pb-1">Vehicle Info</h4>
                                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground font-medium">VIN:</span> <span className="font-mono break-all">{req.vin}</span>
                                        <span className="text-muted-foreground font-medium">Vehicle:</span> <span>{req.year} {req.make} {req.model}</span>
                                        <span className="text-muted-foreground font-medium">Trim:</span> <span>{req.trim || '-'}</span>
                                        <span className="text-muted-foreground font-medium">Mileage:</span> <span>{req.mileage || '-'}</span>
                                        <span className="text-muted-foreground font-medium">Plate:</span> <span>{req.plate || '-'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3 md:space-y-4">
                                    <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider border-b pb-1">Customer Info</h4>
                                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground font-medium">Name:</span> <span className="font-bold">{req.firstName} {req.lastName}</span>
                                        <span className="text-muted-foreground font-medium">Email:</span> <span className="break-all">{req.email}</span>
                                        <span className="text-muted-foreground font-medium">Phone:</span> <span>{req.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-bold text-lg text-primary">Make an Offer</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Offer Price ($)</Label>
                                        <Input 
                                            type="number" 
                                            placeholder="e.g. 15000" 
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 flex flex-col">
                                        <Label>Valid Until</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Admin Notes (Internal)</Label>
                                        <Textarea 
                                            placeholder="Notes about condition or market value..." 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateOffer} disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Send Offer Email
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* DELETE BUTTON */}
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
