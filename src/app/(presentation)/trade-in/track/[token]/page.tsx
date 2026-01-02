
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Phone, MessageCircle, ArrowRight, AlertTriangle, CalendarDays } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/constants";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

// Simple currency formatter if needed
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(price);
};

export default async function TradeInTrackingPage(props: PageProps) {
  const params = await props.params;
  const t = await getTranslations("TradeIn.Tracking");
  
  const request = await prisma.tradeInRequest.findUnique({
    where: { token: params.token }
  });

  if (!request) {
    notFound();
  }

  const isExpired = request.offerExpiresAt && new Date() > request.offerExpiresAt;
  const isOffered = request.status === "OFFERED" || request.status === "COMPLETED"; // Completed also shows history
  const isPending = request.status === "PENDING" || request.status === "REVIEWED";
  const isRejected = request.status === "REJECTED";

  // WhatsApp Link Generation
  const whatsappMessage = encodeURIComponent(`Hi, I'm checking my trade-in offer (Ref: ${request.id}). Is it still valid?`);
  const whatsappUrl = `${SITE_CONFIG.socials.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            {t("pageTitle") || "Trade-In Status"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {request.year} {request.make} {request.model} ({request.trim || "Base"})
          </p>
          <div className="mt-4 flex justify-center items-center gap-2 text-sm text-muted-foreground">
             <span>VIN: {request.vin}</span>
             <span>•</span>
             <span>Ref: #{request.id}</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl overflow-hidden relative">
            {/* Status Indicator Bar */}
            <div className={`h-2 w-full ${
                isOffered && !isExpired ? "bg-green-500" :
                isRejected || isExpired ? "bg-red-500" :
                "bg-yellow-500 animate-pulse"
            }`} />

            <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4">
                    {isOffered && !isExpired && <CheckCircle2 className="w-16 h-16 text-green-500" />}
                    {(isPending) && <Clock className="w-16 h-16 text-yellow-500" />}
                    {(isRejected) && <XCircle className="w-16 h-16 text-red-500" />}
                    {(isExpired) && <AlertTriangle className="w-16 h-16 text-orange-500" />}
                </div>
                <CardTitle className="text-2xl">
                    {isExpired ? (t("status.expired") || "Offer Expired") :
                     isOffered ? (t("status.offered") || "Offer Ready!") :
                     isRejected ? (t("status.rejected") || "Application Declined") :
                     (t("status.pending") || "Under Review")}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                    {isExpired ? (t("desc.expired") || "Your offer validity period has ended. Please contact us to refresh your quote.") :
                     isOffered ? (t("desc.offered") || "Great news! We have prepared a competitive offer for your vehicle.") :
                     isRejected ? (t("desc.rejected") || "Unfortunately, we cannot make an offer on this vehicle at this time.") :
                     (t("desc.pending") || "Our valuation experts are currently reviewing your vehicle details.")}
                </CardDescription>
            </CardHeader>

            <CardContent className="text-center pt-6 pb-8">
                {/* PRICE DISPLAY */}
                {isOffered && request.offeredPrice && !isExpired && (
                    <div className="mb-8 animate-in zoom-in duration-500">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
                            {t("offerAmount") || "Your Offer"}
                        </p>
                        <div className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                            {formatPrice(request.offeredPrice)}
                        </div>
                        {request.offerExpiresAt && (
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                                <CalendarDays className="w-3 h-3" />
                                <span>Valid until {request.offerExpiresAt.toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center bg-muted/30 p-6 md:p-8 border-t border-border/50">
                {/* ACTION BUTTONS */}
                
                {/* Call Button (Always visible) */}
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 gap-2" asChild>
                    <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                        <Phone className="w-4 h-4" />
                        {t("callUs") || "Call Us"}
                    </a>
                </Button>

                {/* WhatsApp (Primary Action if Offered/Expired) */}
                <Button size="lg" className="w-full sm:w-auto h-12 gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white border-none font-bold" asChild>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-5 h-5 fill-current" />
                        {isExpired ? (t("contactToRenew") || "Contact to Renew") : 
                         isOffered ? (t("acceptOffer") || "Finalize Offer") :
                         (t("chatWithUs") || "Chat with Expert")}
                    </a>
                </Button>

                {/* Home Link */}
                <Button variant="ghost" className="sm:hidden mt-2" asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </CardFooter>
        </Card>

        {/* FAQ or Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-card border border-border rounded-xl">
                <h3 className="font-bold mb-2">{t("faq.step1.title") || "1. Appraisal"}</h3>
                <p className="text-sm text-muted-foreground">{t("faq.step1.desc") || "We review your details and market data to determine the best price."}</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
                 <h3 className="font-bold mb-2">{t("faq.step2.title") || "2. Inspection & Payment"}</h3>
                 <p className="text-sm text-muted-foreground">{t("faq.step2.desc") || "Bring your car in for a quick verify, hand over the keys, and get paid instantly."}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
