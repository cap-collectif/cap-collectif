export const EMAIL_SEPARATOR = ','

/**
 * Splits a string into elements (emails), separated by a predefined separator
 *
 * @param {string} string - A string containing email addresses separated by the separator.
 * @returns {string[]} An array of email addresses.
 */
export const splitEmailsFromString = (string: string, separator: string = EMAIL_SEPARATOR): string[] => {
  if (string === '' || string === undefined) {
    return []
  }
  return string?.split(separator)
}
