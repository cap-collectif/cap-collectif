import * as React from 'react'
import { Link } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { CsvEmails } from '../UserGroups.type'
import { getLineNumbers, helpLinkTranslationKey } from '@shared/utils/csvUpload'
import BannersContainer, { Banner, BannerProps } from '@components/BackOffice/BannersContainer/BannersContainer'

type Props = {
  csvEmails: CsvEmails
  isCorrectFormat: boolean
  isLoading: boolean
}

export const CsvImportResult: React.FC<Props> = ({ csvEmails, isCorrectFormat, isLoading }) => {
  const intl = useIntl()

  if (!csvEmails) return null

  const { duplicates, invalid, uniqueAndValid, notFoundEmails } = csvEmails || {}

  const invalidEmailsLineNumbers = getLineNumbers(invalid) || []
  const duplicateEmailsLineNumbers = getLineNumbers(duplicates) || []

  const getBanners = (): Array<BannerProps> => {
    const banners: Array<BannerProps> = []

    // users that were not found (neither has an account nor a pending invitation)
    if (notFoundEmails?.length > 0) {
      banners.push({
        key: 'not-found-users-banner',
        title: intl.formatMessage({ id: 'import.user-not-found' }, { count: notFoundEmails.length }),
        variant: 'warning',
      })
    }

    // valid users ready to import
    if (uniqueAndValid?.length > 0) {
      banners.push({
        key: 'valid-users-banner',
        title: intl.formatMessage({ id: 'valid-users-for-import' }, { count: uniqueAndValid.length }),
        variant: 'success',
      })
    }

    // invalid data model
    if (!uniqueAndValid && !invalid && !duplicates) {
      banners.push({
        key: 'invalid-data-model-banner',
        title: intl.formatMessage({ id: 'invalid-data-model' }),
        variant: 'danger',
      })
    }

    // no user found
    if (uniqueAndValid?.length === 0) {
      banners.push({
        key: 'no-user-found-banner',
        title: intl.formatMessage({ id: 'valid-users-for-import' }, { count: uniqueAndValid.length }),
        variant: 'danger',
      })
    }

    //  duplicates identified
    if (duplicates?.length > 0) {
      banners.push({
        key: 'duplicates-found-banner',
        title: intl.formatMessage(
          { id: 'csv-import.duplicate-lines' },
          {
            count: duplicates.length,
            lines:
              duplicates.length === 1
                ? duplicateEmailsLineNumbers[0]
                : duplicateEmailsLineNumbers.slice(0, -1).join(', '),
            last: duplicateEmailsLineNumbers[duplicateEmailsLineNumbers.length - 1],
          },
        ),
        variant: 'warning',
        children: intl.formatMessage({ id: 'global.import.excluded-lines' }, { count: duplicates.length }),
      })
    }

    // invalid emails
    if (invalid?.length > 0) {
      banners.push({
        key: 'invalid-emails-banner',
        title: intl.formatMessage(
          { id: 'invitation.csv-bad-lines-error.title' },
          {
            count: invalid.length,
            lines:
              invalid.length === 1 ? invalidEmailsLineNumbers[0] : invalidEmailsLineNumbers.slice(0, -1).join(', '),
            last: invalidEmailsLineNumbers[invalidEmailsLineNumbers.length - 1],
            // eslint-disable-next-line react/display-name
            b: (...chunks) => <>{chunks.join('')}</>,
          },
        ),
        variant: 'danger',
        children: intl.formatMessage(
          { id: 'invitation.csv-bad-lines-error.body' },
          {
            count: invalid.length,
            // eslint-disable-next-line react/display-name
            a: (...chunks) => (
              <Link href={intl.formatMessage({ id: helpLinkTranslationKey })} color="primary.600">
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
