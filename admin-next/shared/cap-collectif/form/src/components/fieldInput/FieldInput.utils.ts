import type { IntlShape } from 'react-intl'

export const REGEX_EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const REGEX_URL = /^(https:\/\/)[\w.-]+(?:\.[\w/.-]+)+[\w\-/._~:/?#[\]@!/$&'/(/)/*/+,;=.]+$/gi

export const getMinLengthRule = (minLength: number, intl: IntlShape) => ({
  value: minLength,
  message: intl.formatMessage({ id: 'characters-minimum-required' }, { length: minLength }),
})

export const getMaxLengthRule = (maxLength: number, intl: IntlShape) => ({
  value: maxLength,
  message: intl.formatMessage({ id: 'characters-maximum-required' }, { length: maxLength }),
})

export const getEmailRule = (intl: IntlShape) => ({
  value: REGEX_EMAIL,
  message: intl.formatMessage({ id: 'global.constraints.email.invalid' }),
})

export const normalizePhoneValue = (value: string): string => value.replace(/\D/g, '')

export const formatPhoneValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return ''
  }
  const normalized = normalizePhoneValue(String(value))
  if (!normalized) {
    return ''
  }
  return normalized.match(/.{1,2}/g)?.join(' ') ?? ''
}
