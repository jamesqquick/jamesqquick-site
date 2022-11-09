const getFormattedDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US").format(date);
};

export { getFormattedDate };
