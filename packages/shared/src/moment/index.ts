import dayjs from 'dayjs';

type DateType = string | number | Date | dayjs.Dayjs;

type FormatType = string;

export const formatDate = (date: DateType, format: FormatType = 'YYYY-MM-DD HH:mm:ss') => {
  const dayjsDate = dayjs(date);

  if (dayjsDate.isValid()) {
    return dayjsDate.format(format);
  }

  return '';
};

export type { DateType, FormatType };
