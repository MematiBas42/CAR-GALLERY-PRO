"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateMonthlyPayment, formatCurrency } from "@/lib/financial-utils";

export const FinancingCalculator = () => {
  const t = useTranslations("Financing.calculator");
  
  const [price, setPrice] = useState(50000);
  const [deposit, setDeposit] = useState(5000);
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState(5.9);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = price - deposit;
    const payment = calculateMonthlyPayment(principal, rate, term);
    setMonthlyPayment(payment);
  }, [price, deposit, term, rate]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("disclaimer")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-primary/5 p-6 rounded-lg text-center">
             <div className="text-sm font-medium text-muted-foreground mb-1">{t("monthly")}</div>
             <div className="text-4xl font-bold text-primary">
                 {formatCurrency(monthlyPayment)}
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{t("price")}</Label>
                    <Input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-24 text-right"
                    />
                </div>
                <Slider 
                    value={[price]} 
                    min={5000} 
                    max={200000} 
                    step={1000} 
                    onValueChange={(val) => setPrice(val[0])} 
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{t("deposit")}</Label>
                    <Input 
                        type="number" 
                        value={deposit} 
                        onChange={(e) => setDeposit(Number(e.target.value))}
                        className="w-24 text-right"
                    />
                </div>
                <Slider 
                    value={[deposit]} 
                    min={0} 
                    max={price} 
                    step={500} 
                    onValueChange={(val) => setDeposit(val[0])} 
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{t("term")}</Label>
                    <div className="font-mono text-sm">{term} Months</div>
                </div>
                <Slider 
                    value={[term]} 
                    min={12} 
                    max={84} 
                    step={12} 
                    onValueChange={(val) => setTerm(val[0])} 
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>12</span>
                    <span>24</span>
                    <span>36</span>
                    <span>48</span>
                    <span>60</span>
                    <span>72</span>
                    <span>84</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{t("rate")}</Label>
                    <Input 
                        type="number" 
                        value={rate} 
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-24 text-right"
                        step={0.1}
                    />
                </div>
                <Slider 
                    value={[rate]} 
                    min={0.1} 
                    max={20} 
                    step={0.1} 
                    onValueChange={(val) => setRate(val[0])} 
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
