type MultipleChoiceValue = { labels: string[]; other: string | null }

/**
 * Checks if a form response value is empty.
 * Handles standard empty values (null, undefined, empty string)
 * and the multiple choice format { labels: [], other: null }.
 */
export const isResponseValueEmpty = (val: unknown): boolean => {
  if (val === null || val === '' || val === undefined) return true
  if (typeof val === 'object' && val !== null && 'labels' in val) {
    const multipleChoiceValue = val as MultipleChoiceValue
    return multipleChoiceValue.labels?.length === 0 && !multipleChoiceValue.other
  }
  return false
}
