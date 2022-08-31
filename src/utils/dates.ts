const getFormattedDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = (date.getDate() + 1).toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export { getFormattedDate };
