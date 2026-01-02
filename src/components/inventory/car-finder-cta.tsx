"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Send, CheckCircle2, Car, Loader2 } from "lucide-react";
import { useState } from "react";
import { submitCarFinderRequest } from "@/app/_actions/car-finder";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const CarFinderCTA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Basic translation support (fallback to English strings)
  const t = useTranslations("Inventory"); 

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    yearMin: "",
    yearMax: "",
    budget: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if(!formData.make || !formData.email || !formData.phone) {
        toast.error("Please fill in the required fields (Make, Email, Phone)");
        setLoading(false);
        return;
    }

    const result = await submitCarFinderRequest(formData);
    setLoading(false);

    if (result.success) {
        setIsSuccess(true);
    } else {
        toast.error("Something went wrong. Please try again.");
    }
  };

  if (isSuccess) {
      return (
        <div className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                We&apos;ve started the search for your <span className="text-foreground font-bold">{formData.make} {formData.model}</span>. 
                Our team will scour our network and notify you as soon as we find a match.
            </p>
            <Button variant="outline" onClick={() => { setIsSuccess(false); setIsOpen(false); setFormData({ ...formData, make: "", model: "" }); }}>
                Close
            </Button>
        </div>
      );
  }

  return (
    <div className="w-full bg-card border border-border rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
      <div className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        
        {/* Left Side: Text & Icon */}
        <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center justify-center md:justify-start gap-2 text-primary font-bold tracking-wider uppercase text-xs md:text-sm">
                <Search className="w-4 h-4" />
                <span>Concierge Service</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-muted-foreground text-lg">
                Let us do the heavy lifting. Tell us exactly what you want, and we&apos;ll use our nationwide network to find your dream car.
            </p>
            {!isOpen && (
                <Button size="lg" className="mt-4 font-bold text-base h-12 px-8" onClick={() => setIsOpen(true)}>
                    Start My Search
                </Button>
            )}
        </div>

        {/* Right Side: Decorative Icon (Hidden when form is open) */}
        {!isOpen && (
            <div className="hidden md:flex items-center justify-center w-48 h-48 bg-secondary/50 rounded-full shrink-0">
                <Car className="w-24 h-24 text-muted-foreground/50" />
            </div>
        )}
      </div>

      {/* Expandable Form */}
      {isOpen && (
        <div className="border-t border-border bg-muted/30 p-6 md:p-10 animate-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                
                {/* Car Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Car className="w-5 h-5 text-primary" />
                        Vehicle Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Make *</Label>
                            <Input placeholder="e.g. BMW, Mercedes, Ford" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <Input placeholder="e.g. X5, C-Class, F-150" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Year</Label>
                                <Input type="number" placeholder="2018" value={formData.yearMin} onChange={e => setFormData({...formData, yearMin: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Year</Label>
                                <Input type="number" placeholder="2024" value={formData.yearMax} onChange={e => setFormData({...formData, yearMax: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Budget (Approx)</Label>
                            <Input placeholder="e.g. $40,000" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone *</Label>
                            <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                    <Button type="submit" size="lg" className="flex-1 font-bold h-12 text-base" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                        Find This Car
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="h-12 px-8" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                </div>

            </form>
        </div>
      )}
    </div>
  );
};
