import { isEmail } from '@shared/utils/validators'
import { CsvEmails } from './UserGroups.type'

export const CONNECTION_NODES_PER_PAGE = 50

export const EMAIL_SEPARATOR = ','

export const MAX_EMAILS = 5

export const csvEmailsDefaultValue = {
  duplicates: [],
  invalid: [],
  uniqueAndValid: [],
}

export const getInputFromFile = (content: string, setIsCorrectFormat: (value: boolean) => void): CsvEmails => {
  const csvLines = content.split('\n')

  // check if there is content outside of the first column
  for (let line of csvLines) {
    const columns = line.split(',')
    if (columns.length > 1 && columns.slice(1).some(col => col.trim() !== '')) {
      setIsCorrectFormat(false)
      return csvEmailsDefaultValue
    }
  }
  setIsCorrectFormat(true)

  const lines = csvLines.map(line => line.trim()).filter(Boolean)
  const emails = lines
    .map((line, index) => ({ email: line, line: (index + 1).toString() }))
    .filter(item => isEmail(item.email))

  const invalid = lines
    .map((line, index) => ({ email: line, line: (index + 1).toString() }))
    .filter(item => !isEmail(item.email))

  const duplicates = emails.filter((item, index, self) => self.findIndex(e => e.email === item.email) !== index)

  const uniqueAndValid = Array.from(new Set(emails.map(item => item.email))).map(email =>
    emails.find(item => item.email === email),
  )

  return {
    duplicates,
    invalid,
    uniqueAndValid,
  }
}
