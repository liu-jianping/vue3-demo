import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * 格式化为日期时间
 */
export function formatToDateTime(
  date?: dayjs.Dayjs | string | number,
  format = DATE_TIME_FORMAT
): string {
  return dayjs(date).format(format);
}

/**
 * 格式化为日期
 */
export function formatToDate(
  date?: dayjs.Dayjs | string | number,
  format = DATE_FORMAT
): string {
  return dayjs(date).format(format);
}

export { dayjs };
