import moment from 'moment';

type DateType = string | number | Date | moment.Moment;

type FormatType = string;

export const formatDate = (date: DateType, format: FormatType = 'YYYY-MM-DD HH:mm:ss') => {
  const momentDate = moment(date);

  if (momentDate.isValid()) {
    return momentDate.format(format);
  }

  return '';
};

export type { DateType, FormatType };
