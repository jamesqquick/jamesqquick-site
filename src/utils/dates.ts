const getFormattedDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US").format(date);
};

export { getFormattedDate };
