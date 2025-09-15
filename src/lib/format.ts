export function relativeTime(iso: string): string {
  const dt = new Date(iso);
  const diff = Date.now() - dt.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'baru saja';
  const min = Math.floor(sec / 60);
  if (min < 60) return min + 'm';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'j';
  const day = Math.floor(hr / 24);
  if (day < 7) return day + 'h';
  const week = Math.floor(day / 7);
  if (week < 5) return week + 'w';
  const month = Math.floor(day / 30);
  if (month < 12) return month + 'bln';
  const year = Math.floor(day / 365);
  return year + 'th';
}
