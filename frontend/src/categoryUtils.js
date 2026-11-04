export const getCategoryColor = (name) => {
  const key = (name || "").toLowerCase();

  if (key.includes("food")) return { bg: "#fef3c7", text: "#b45309" };
  if (key.includes("grocer")) return { bg: "#dcfce7", text: "#166534" };
  if (key.includes("transport")) return { bg: "#dbeafe", text: "#1d4ed8" };
  if (key.includes("bill")) return { bg: "#fee2e2", text: "#b91c1c" };
  if (key.includes("health")) return { bg: "#fce7f3", text: "#be185d" };
  if (key.includes("shopping")) return { bg: "#ede9fe", text: "#6d28d9" };

  return { bg: "#e2e8f0", text: "#334155" };
};