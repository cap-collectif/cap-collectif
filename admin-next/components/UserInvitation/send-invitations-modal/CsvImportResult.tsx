import * as React from 'react'
import { Link } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { CsvEmails, EmailAvailabilities } from '@components/UserInvitation/UserInvite.type'
import { filterAvailableEmails } from '@components/UserInvitation/utils'
import BannersContainer, { Banner, BannerProps } from '@components/BannersContainer/BannersContainer'
import { getLineNumbers, getListAsString, helpLinkTranslationKey } from '@shared/utils/csvUpload'

type Props = {
  csvEmails: CsvEmails
  emailAvailabilities: EmailAvailabilities
  isCorrectFormat: boolean
  isLoading: boolean
}

export const CsvImportResult = ({ csvEmails, emailAvailabilities, isCorrectFormat, isLoading }: Props) => {
  const intl = useIntl()

  if (!csvEmails) return null

  const { duplicateLines, importedUsers, invalidLines } = csvEmails || {}

  // an email that's already used in an account cannot be invited again
  // it must be ignored in the count for identified emails, and not be included in the list of invitable emails
  const alreadyRegistered = emailAvailabilities?.alreadyRegistered ?? []
  // relaunching PENDING invitations can only be done via the quick action button in the invitations list component
  // relaunching EXPIRED invitations can be triggered when the user is invited via the invitation modal
  const cannotBeInvited = emailAvailabilities?.cannotBeInvited ?? []

  const unavailableEmails = [...alreadyRegistered, ...cannotBeInvited]

  const importedUsersEmails = importedUsers?.map(user => user.email) || []
  const invitableEmails = filterAvailableEmails(importedUsersEmails, unavailableEmails)

  const invalidEmailsLineNumbers = getLineNumbers(invalidLines)
  const duplicateEmailsLineNumbers = getLineNumbers(duplicateLines)

  const getBanners = (): Array<BannerProps> => {
    const banners: Array<BannerProps> = []

    //  email already linked to an account
    if (alreadyRegistered.length > 0) {
      banners.push({
        key: 'email-already-registered-banner',
        title: intl.formatMessage({ id: 'import.users-already-registered' }, { count: alreadyRegistered.length }),
        variant: 'warning',
      })
    }

    // email already received an invitation
    if (cannotBeInvited.length > 0) {
      banners.push({
        key: 'email-already-invited-banner',
        title: intl.formatMessage({ id: 'invitations.already-used-emails' }, { count: cannotBeInvited.length }),
        variant: 'warning',
        children: getListAsString(cannotBeInvited),
      })
    }

    // valid users ready to import
    if (invitableEmails.length > 0) {
      banners.push({
        key: 'valid-users-banner',
        title: intl.formatMessage({ id: 'valid-users-for-import' }, { count: invitableEmails.length }),
        variant: 'success',
      })
    }

    // invalid data model
    if (!importedUsers && !duplicateLines && invalidLines.length > 0) {
      banners.push({
        key: 'invalid-data-model-banner',
        title: intl.formatMessage({ id: 'invalid-data-model' }),
        variant: 'danger',
      })
    }

    // no user found
    if (importedUsers.length === 0) {
      banners.push({
        key: 'no-user-found-banner',
        title: intl.formatMessage({ id: 'valid-users-for-import' }, { count: importedUsers.length }),
        variant: 'danger',
      })
    }

    // duplicates identified
    if (duplicateLines.length > 0) {
      banners.push({
        key: 'duplicates-found-banner',
        title: intl.formatMessage(
          { id: 'csv-import.duplicate-lines' },
          {
            count: duplicateLines.length,
            lines:
              duplicateLines.length === 1
                ? duplicateEmailsLineNumbers[0]
                : duplicateEmailsLineNumbers.slice(0, -1).join(', '),
            last: duplicateEmailsLineNumbers[duplicateEmailsLineNumbers.length - 1],
          },
        ),
        variant: 'warning',
        children: intl.formatMessage({ id: 'global.import.excluded-lines' }, { count: duplicateLines.length }),
      })
    }

    // invalid emails
    if (invalidLines.length > 0) {
      banners.push({
        key: 'invalid-emails-banner',
        title: intl.formatMessage(
          { id: 'invitation.csv-bad-lines-error.title' },
          {
            count: invalidLines.length,
            lines:
              invalidLines.length === 1
                ? invalidEmailsLineNumbers[0]
                : invalidEmailsLineNumbers.slice(0, -1).join(', '),
            last: invalidEmailsLineNumbers[invalidEmailsLineNumbers.length - 1],
            // eslint-disable-next-line react/display-name
            b: (...chunks) => <>{chunks.join('')}</>,
          },
        ),
        variant: 'danger',
        children: intl.formatMessage(
          { id: 'invitation.csv-bad-lines-error.body' },
          {
            count: invalidLines.length,
            // eslint-disable-next-line react/display-name
            a: (...chunks) => (
              <Link href={intl.formatMessage({ id: helpLinkTranslationKey })} color="primary.base">
                {chunks}
              </Link>
            ),
          },
        ),
      })
    }

    return banners
  }

  return (
    <BannersContainer isCorrectFormat={isCorrectFormat} isLoading={isLoading}>
      {getBanners().map(banner => (
        <Banner title={banner.title} variant={banner.variant} key={banner.key}>
          {banner.children}
        </Banner>
      ))}
    </BannersContainer>
  )
}

export default CsvImportResult
