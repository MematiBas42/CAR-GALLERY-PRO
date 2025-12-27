export const calculateMonthlyPayment = (
  principal: number,
  annualInterestRate: number,
  months: number
): number => {
  if (principal <= 0 || months <= 0) return 0;
  if (annualInterestRate <= 0) return principal / months;

  const monthlyRate = annualInterestRate / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;
  
  return principal * (numerator / denominator);
};

export const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
