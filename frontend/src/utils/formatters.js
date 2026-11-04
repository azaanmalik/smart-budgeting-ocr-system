export const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};