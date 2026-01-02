"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2, DollarSign, Loader2, Car, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { decodeVin, submitTradeInRequest } from "@/app/_actions/trade-in";

export const TradeInSection = () => {
  const t = useTranslations("Homepage.TradeIn");
  
  // States
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: VIN Entry, 2: Details & Contact, 3: Success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    vin: "",
    plate: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    mileage: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const handleVinSubmit = async () => {
    setErrorMsg(null);
    if (!formData.vin || formData.vin.length < 11) {
        setErrorMsg("Please enter a valid VIN (at least 11 characters)");
        return;
    }

    setLoading(true);
    try {
        const result = await decodeVin(formData.vin);
        if (result.error) {
             setErrorMsg(result.error);
             // Optional: Allow user to proceed manually even if error
             // setStep(2); 
        } else if (!result.year && !result.make) {
             setErrorMsg("Could not decode vehicle details. Please check the VIN.");
             // Allow manual entry after failure?
             // setStep(2);
        } else {
             setVehicleData(result);
             setFormData(prev => ({
                 ...prev,
                 year: result.year?.toString() || "",
                 make: result.make || "",
                 model: result.model || "",
                 trim: result.trim || ""
             }));
             setStep(2);
        }
    } catch (e) {
        setErrorMsg("Connection error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
     setErrorMsg(null);
     if (!formData.firstName || !formData.email || !formData.phone) {
         toast.error("Please fill in all contact fields");
         return;
     }

     setLoading(true);
     const result = await submitTradeInRequest(formData);
     setLoading(false);

     if (result.success) {
         setStep(3);
     } else {
         setErrorMsg(result.error || "Failed to submit request.");
         toast.error("Failed to submit request.");
     }
  };

  return (
    <section className="relative w-full py-8 lg:py-12 overflow-hidden bg-white dark:bg-background border-t border-black/5 dark:border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[15%] right-[-2%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
         <div className="absolute bottom-[5%] left-[-5%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text & Value Prop */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-primary font-bold tracking-wider uppercase text-sm">
              <DollarSign className="w-4 h-4" />
              <span>{t("subTitle") || "Top Dollar Paid"}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              {t("title") || "We Want Your Car"}
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              {t("description") || "Skip the hassle of private selling. Get a competitive, instant offer for your vehicle today. We buy all makes and models."}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto lg:mx-0">
               <div className="flex items-center justify-center lg:justify-start gap-2 text-sm font-medium text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{t("benefit1") || "Instant Offer"}</span>
               </div>
               <div className="flex items-center justify-center lg:justify-start gap-2 text-sm font-medium text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{t("benefit2") || "Hassle-Free Process"}</span>
               </div>
               <div className="col-span-2 flex items-center justify-center lg:justify-start gap-2 text-sm font-medium text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{t("benefit3") || "Fast Payment"}</span>
               </div>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none py-6 lg:py-8 group/card">
            {/* Gradient Border Glow Effect */}
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[2rem] blur-xl opacity-50 group-hover/card:opacity-100 transition-opacity duration-500" />
            
            {/* Glass Card */}
            <div className="relative bg-white/80 dark:bg-card/90 backdrop-blur-2xl border border-primary/20 rounded-[2rem] p-6 md:p-8 shadow-2xl transition-all duration-500 group-hover/card:border-primary/40 group-hover/card:translate-y-[-4px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 rounded-[2rem] pointer-events-none" />
              
              <div className="relative z-10 min-h-[300px] flex flex-col justify-center">
                
                {/* STEP 1: INITIAL ENTRY */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-2xl font-black mb-6 text-center bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent uppercase tracking-tight">{t("cardTitle") || "Get Your Offer"}</h3>
                        <Tabs defaultValue="vin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="vin">By VIN</TabsTrigger>
                            <TabsTrigger value="plate">By Plate</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="vin" className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
                            <Input 
                                id="vin" 
                                placeholder="Enter your 17-digit VIN" 
                                className="bg-background/50 border-white/10 h-12"
                                value={formData.vin}
                                onChange={(e) => {
                                    setFormData({...formData, vin: e.target.value.toUpperCase()});
                                    if(errorMsg) setErrorMsg(null);
                                }}
                            />
                            </div>

                            {/* Error Display */}
                            {errorMsg && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <Button size="lg" className="w-full h-12 text-base font-bold group" onClick={handleVinSubmit} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {loading ? "Decoding..." : (t("cta") || "Get Value")}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />}
                            </Button>
                        </TabsContent>
                        
                        <TabsContent value="plate" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="plate">License Plate (Coming Soon)</Label>
                                <div className="p-4 rounded-lg bg-secondary/50 border border-white/5 text-center text-sm text-muted-foreground">
                                    Plate lookup is currently unavailable. Please use VIN for instant decoding.
                                </div>
                            </div>
                            <Button size="lg" variant="outline" className="w-full h-12 opacity-50 cursor-not-allowed">
                                Look up Plate
                            </Button>
                        </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* STEP 2: DETAILS & CONTACT */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl mb-4">
                            <Car className="w-6 h-6 text-green-500" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Vehicle Found</p>
                                <p className="font-bold text-foreground">
                                    {formData.year} {formData.make} {formData.model}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={() => setStep(1)}>Change</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <Label className="text-xs">First Name</Label>
                                <Input 
                                    className="bg-background/50 h-10" 
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                />
                             </div>
                             <div className="space-y-1">
                                <Label className="text-xs">Last Name</Label>
                                <Input 
                                    className="bg-background/50 h-10" 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                />
                             </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Email Address</Label>
                            <Input 
                                type="email" 
                                className="bg-background/50 h-10" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Phone Number</Label>
                                <Input 
                                    type="tel" 
                                    className="bg-background/50 h-10" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Mileage</Label>
                                <Input 
                                    type="number" 
                                    className="bg-background/50 h-10" 
                                    placeholder="e.g. 45000"
                                    value={formData.mileage}
                                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                                />
                            </div>
                        </div>

                        <Button size="lg" className="w-full h-12 font-bold mt-2" onClick={handleSubmitFinal} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit for Valuation
                        </Button>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 3 && (
                    <div className="animate-in zoom-in duration-300 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                        <p className="text-muted-foreground mb-6">
                            We have received your trade-in request for the <span className="text-foreground font-semibold">{formData.year} {formData.make} {formData.model}</span>.
                            Our team is preparing your valuation and will contact you shortly.
                        </p>
                        <Button variant="outline" onClick={() => {
                            setStep(1);
                            setFormData({
                                vin: "", plate: "", year: "", make: "", model: "", trim: "", mileage: "", firstName: "", lastName: "", email: "", phone: ""
                            });
                        }}>
                            Get Another Quote
                        </Button>
                    </div>
                )}

                {step === 1 && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                    {t("disclaimer") || "No purchase necessary. Offer valid for 7 days."}
                    </p>
                )}
              </div>
            </div>
            
            {/* Floating Elements for Depth */}
            <div className="absolute top-4 -right-12 w-24 h-24 bg-primary rounded-2xl rotate-12 opacity-20 blur-xl md:animate-pulse" />
            <div className="absolute bottom-4 -left-8 w-32 h-32 bg-secondary rounded-full opacity-20 blur-xl" />
          </div>

        </div>
      </div>
    </section>
  );
};
