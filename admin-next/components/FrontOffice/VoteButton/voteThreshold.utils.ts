// Minimum width of the gauge fill, so that the very first vote is visible
export const THRESHOLD_GAUGE_MIN_FILL_WIDTH = 4

/**
 * Fill percentage of the threshold gauge.
 * Rounded down so the gauge is only full once the threshold is actually reached.
 */
export const getThresholdProgress = (votesCount: number, voteThreshold: number): number => {
  if (voteThreshold <= 0 || votesCount <= 0) return 0

  return Math.min(100, Math.floor((votesCount / voteThreshold) * 100))
}
