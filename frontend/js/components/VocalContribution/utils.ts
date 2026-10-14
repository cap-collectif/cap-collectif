/** Formats seconds as m:ss. */
export const formatClock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds + 0.0001))
  return `${Math.floor(total / 60)}:${`0${total % 60}`.slice(-2)}`
}

export const TRIGGER_SELECTOR = 'a[href*="REMPLACER-lien-contribution-vocale"], a[href$="#dicter"], [data-gc-vocal]'
export const OPEN_HASH = '#dicter'
