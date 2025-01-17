import * as React from 'react'
import { CapUIIconSize, Flex, InfoMessage, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

type BannersContainerProps = {
  isCorrectFormat: boolean
  isLoading: boolean
  children?: React.ReactNode
}

export type BannerProps = {
  key: string
  title?: React.ReactNode
  variant: 'danger' | 'warning' | 'success'
  children?: React.ReactNode
}

export const BannersContainer = ({ isCorrectFormat, isLoading, children }: BannersContainerProps): JSX.Element => {
  const intl = useIntl()

  if (!isCorrectFormat)
    return (
      <Banner title={intl.formatMessage({ id: 'file-not-imported' })} variant="danger" key="file-not-imported">
        {intl.formatMessage({
          id: 'csv-import-fail-message',
        })}
      </Banner>
    )

  if (isLoading) {
    return (
      <Flex justifyContent="center">
        <Spinner size={CapUIIconSize.Lg} color="primary.600" />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap={2}>
      {children}
    </Flex>
  )
}

export default BannersContainer

export const Banner = ({ title, children, variant }: BannerProps): JSX.Element => {
  return (
    <InfoMessage variant={variant} className="import-results">
      {title && <InfoMessage.Title withIcon>{title}</InfoMessage.Title>}
      {children && <InfoMessage.Content>{children}</InfoMessage.Content>}
    </InfoMessage>
  )
}
