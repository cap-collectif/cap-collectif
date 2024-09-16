import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { RegistrationButtonQuery } from '@relay/RegistrationButtonQuery.graphql'
import { RegistrationButton_query$key } from '@relay/RegistrationButton_query.graphql'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { useAnalytics } from 'use-analytics'
import { useEventListener } from '@shared/hooks/useEventListener'
import { useDisclosure } from '@liinkiing/react-hooks'
import RegistrationModal from '@shared/register/RegistrationModal'
import { getTheme } from '@shared/navbar/NavBar.utils'
import { ButtonProps, Button } from '@cap-collectif/ui'
import RegistrationFormWrapper from './RegistrationFormWrapper'

export const openRegistrationModal = 'openRegistrationModal'

export const QUERY = graphql`
  query RegistrationButtonQuery {
    ...RegistrationButton_query
  }
`

export const FRAGMENT = graphql`
  fragment RegistrationButton_query on Query {
    isAuthenticated
    siteColors {
      keyname
      value
    }
    ...RegistrationModal_query
    ...RegistrationFormWrapper_query
  }
`

export const RegistrationButton: React.FC<ButtonProps & { query: RegistrationButton_query$key }> = ({
  query: queryKey,
  ...props
}) => {
  const query = useFragment(FRAGMENT, queryKey)
  const intl = useIntl()
  const newNavbar = useFeatureFlag('new_navbar')
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const registration = useFeatureFlag('registration')
  const { track } = useAnalytics()

  useEventListener(openRegistrationModal, () => onOpen())
  const theme = getTheme(query.siteColors)

  if (!registration || query.isAuthenticated) return null

  return (
    <>
      <RegistrationFormWrapper query={query}>
        <RegistrationModal show={isOpen} onClose={onClose} query={query} />
      </RegistrationFormWrapper>
      <Button
        id="registration-button"
        my={2}
        onClick={() => {
          track('registration_click', {
            source: 'button',
          })
          onOpen()
        }}
        variant="secondary"
        variantColor="primary"
        sx={
          !newNavbar
            ? {
                color: `${theme.primaryLabel} !important`,
                background: `${theme.primaryColor} !important`,
                border: 'none',
              }
            : null
        }
        aria-label={intl.formatMessage({
          id: 'open.inscription_modal',
        })}
        {...props}
      >
        {intl.formatMessage({ id: 'global.registration' })}
      </Button>
    </>
  )
}

export const RegistrationButtonQueryWrapper: React.FC<ButtonProps> = props => {
  const query = useLazyLoadQuery<RegistrationButtonQuery>(QUERY, {})

  return <RegistrationButton {...props} query={query} />
}

export default RegistrationButton
