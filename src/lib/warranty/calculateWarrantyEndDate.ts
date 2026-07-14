export function calculateWarrantyEndDate(
  startDate: Date | string,
  warrantyPeriodMonths: number,
): Date {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + warrantyPeriodMonths);

  if (end.getDate() !== start.getDate()) {
    end.setDate(0);
  }

  return end;
}

export function formatWarrantyPeriod(months: number): string {
  if (months < 12) return `${months} ay`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} yıl`;
  return `${years} yıl ${remainingMonths} ay`;
}

export function getDefaultWarrantyPeriod(): number {
  return 24;
}
