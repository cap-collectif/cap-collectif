import { IntlShape } from 'react-intl'
import { isEmail } from '../../../frontend/js/services/Validator'
import { environment } from '@utils/relay-environement'
import { fetchQuery, GraphQLTaggedNode } from 'react-relay'
import { CsvEmails, EmailAvailabilities, EmailInput } from '@components/UserInvitation/UserInvite.type'
import { UserInviteModalStepsChooseUsersQuery$data } from '@relay/UserInviteModalStepsChooseUsersQuery.graphql'

export const emailSeparator = ','

export const CONNECTION_NODES_PER_PAGE: number = 50

export const maxEmails = 5

export const emailAvailabilitiesDefault: EmailAvailabilities = {
  emailsAlreadyLinkedToAnAccount: [],
  emailsAlreadyReceivedInvitation: [],
}

/**
 * Processes the content of a CSV file and extracts email-related data.
 * @param {string} content - The string content of the CSV file.
 * @param {function} setCsvIsWrongFormat - Function to set the flag indicating if the CSV format is incorrect.
 * @returns {CsvEmails} An object containing arrays of duplicate lines, imported users, and invalid lines.
 */
export const getInputFromFile = (content: string, setCsvIsWrongFormat: (value: boolean) => void): CsvEmails => {
  const csvLines = content.split('\n')

  // check if there is content outside of the first column
  for (let line of csvLines) {
    const columns = line.split(',')
    if (columns.length > 1 && columns.slice(1).some(col => col.trim() !== '')) {
      setCsvIsWrongFormat(true)
      return {
        duplicateLines: [],
        importedUsers: [],
        invalidLines: [],
      }
    }
  }
  setCsvIsWrongFormat(false)

  const lines = csvLines.map(line => line.trim()).filter(Boolean)
  const emails = lines
    .map((line, index) => ({ email: line, line: (index + 1).toString() }))
    .filter(item => isEmail(item.email))

  const invalidLines = lines
    .map((line, index) => ({ email: line, line: (index + 1).toString() }))
    .filter(item => !isEmail(item.email))

  const duplicateLines = emails.filter((item, index, self) => self.findIndex(e => e.email === item.email) !== index)

  const uniqueAndValidEmails = Array.from(new Set(emails.map(item => item.email))).map(email =>
    emails.find(item => item.email === email),
  )

  return {
    duplicateLines,
    importedUsers: uniqueAndValidEmails,
    invalidLines,
  }
}

export const getRoleOptions = (intl: IntlShape, isProjectAdminEnabled: boolean) => {
  const roles = [
    {
      id: 'ROLE_USER',
      label: intl.formatMessage({ id: 'roles.user' }),
      useIdAsValue: true,
    },
    isProjectAdminEnabled && {
      id: 'ROLE_PROJECT_ADMIN',
      label: intl.formatMessage({ id: 'roles.project_admin' }),
      useIdAsValue: true,
    },
    {
      id: 'ROLE_ADMIN',
      label: intl.formatMessage({ id: 'roles.admin' }),
      useIdAsValue: true,
    },
  ].filter(Boolean)

  return roles
}

export const getInvitationsAvailability = async (
  inputEmails: string,
  importedUsers: string[],
  query: GraphQLTaggedNode,
): Promise<EmailAvailabilities> => {
  if (inputEmails === '' && importedUsers?.length === 0) {
    return
  }

  let validEmails = []

  if (inputEmails !== '') {
    const _inputEmails = inputEmails.split(emailSeparator)
    const formattedInputEmails = _inputEmails.filter(email => isEmail(email))
    validEmails = [...validEmails, ...formattedInputEmails]
  }

  if (importedUsers?.length > 0) {
    validEmails = [...validEmails, ...importedUsers]
  }

  if (validEmails.length > 0) {
    const response: any = await fetchQuery(environment as any, query, {
      emails: validEmails,
    }).toPromise()

    const invitationsAvailabilitiesData: UserInviteModalStepsChooseUsersQuery$data['userInvitationsAvailabilitySearch'] =
      response.userInvitationsAvailabilitySearch

    const emailsAlreadyLinkedToAnAccount = invitationsAvailabilitiesData.edges
      .filter(item => !item.node.availableForUser)
      .map(item => item.node.email)

    const emailsAlreadyReceivedInvitation = invitationsAvailabilitiesData.edges
      .filter(item => !item.node.availableForInvitation && item.node.availableForUser)
      .map(item => item.node.email)

    return {
      emailsAlreadyLinkedToAnAccount: emailsAlreadyLinkedToAnAccount ?? [],
      emailsAlreadyReceivedInvitation: emailsAlreadyReceivedInvitation ?? [],
    }
  }
}

/**
 * Converts an array of strings into a single comma-separated string.
 * @param {string[]} array - The array of strings to be joined.
 * @returns {string} The joined string with each element separated by a comma and space, followed by a period. Returns an empty string if the array is empty.
 */
export const getListAsString = (array: string[]): string => {
  if (array.length === 0) return ''
  return array.join(', ') + '.'
}

/**
 * Filters out unavailable emails from the list of imported users.
 * @param {string[]} importedUsers - An array of email addresses representing the imported users.
 * @param {string[]} unavailableEmails - An array of email addresses that are unavailable and need to be removed from the importedUsers array.
 * @returns {string[]} A new array of email addresses from importedUsers with the unavailable emails removed.
 */
export const filterAvailableEmails = (importedUsers: string[], unavailableEmails: string[]): string[] => {
  return unavailableEmails.length === 0
    ? importedUsers
    : importedUsers.filter(item => !unavailableEmails.includes(item))
}

/**
 * Extracts the line numbers from an array of objects.
 * @param {EmailInput[]} lines - An array of objects, each containing a "line" property.
 * @returns {string[]} An array of line numbers, indicating which lines met a specific condition in the imported .csv file.
 */
export const getLineNumbers = (lines: EmailInput[]): string[] => {
  return lines.map(item => item.line)
}

/**
 * Splits a string into elements (emails), separated by a predefined separator
 *
 * @param {string} string - A string containing email addresses separated by the separator.
 * @returns {string[]} An array of email addresses.
 */
export const splitEmailsFromString = (string: string): string[] => {
  if (string === '') {
    return []
  }
  return string?.split(emailSeparator)
}
