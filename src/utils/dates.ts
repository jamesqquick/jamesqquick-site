const getFormattedDate = (date: Date): string | null => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US").format(date);
};

export { getFormattedDate };
