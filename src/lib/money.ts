export function formatMoney(paise: number, currency = "INR") {
  const rupees = (paise ?? 0) / 100;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(rupees);
}
