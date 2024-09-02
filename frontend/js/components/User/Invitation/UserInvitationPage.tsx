import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { Container, LogoContainer, ContentContainer, Symbols, BackLink } from './UserInvitationPage.style'
import RegistrationForm from '@shared/register/RegistrationForm'
import SubmitButton from '~/components/Form/SubmitButton'
import type { UserInvitationPage_query$key } from '~relay/UserInvitationPage_query.graphql'
import type { UserInvitationPage_logo$key } from '~relay/UserInvitationPage_logo.graphql'
import Image from '~ui/Primitives/Image'
import { Box, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
type RelayProps = {
  readonly queryFragmentRef: UserInvitationPage_query$key
  readonly logoFragmentRef: UserInvitationPage_logo$key
}
type ComponentProps = {
  readonly email: string
  readonly token: string
  readonly hasEnabledSSO: boolean
  readonly primaryColor: string
  readonly btnTextColor: string
  readonly backgroundColor: string
}
type Props = ComponentProps & RelayProps
const QUERY_FRAGMENT = graphql`
  fragment UserInvitationPage_query on Query {
    ...RegistrationForm_query
    organizationName: siteParameter(keyname: "global.site.organization_name") {
      value
    }
  }
`
const LOGO_FRAGMENT = graphql`
  fragment UserInvitationPage_logo on SiteImage {
    media {
      url(format: "reference")
    }
  }
`
export const UserInvitationPage = ({
  queryFragmentRef,
  logoFragmentRef,
  hasEnabledSSO,
  primaryColor,
  btnTextColor,
  backgroundColor,
}: Props) => {
  const intl = useIntl()
  const query = useFragment(QUERY_FRAGMENT, queryFragmentRef)
  const logo = useFragment(LOGO_FRAGMENT, logoFragmentRef)
  const organizationName = query?.organizationName?.value

  const {
    formState: { isSubmitting },
  } = useFormContext()

  return (
    <Container>
      <ContentContainer primaryColor={primaryColor} btnText={btnTextColor}>
        {hasEnabledSSO && (
          <Flex alignItems="center" mb={4}>
            <Icon name={CapUIIcon.LongArrowLeft} size={CapUIIconSize.Sm} />
            <BackLink to="/sso">
              {intl.formatMessage({
                id: 'global.back',
              })}
            </BackLink>
          </Flex>
        )}
        <h1>
          <FormattedMessage id="global-welcome" /> 👋
        </h1>

        <p className="welcome">
          <FormattedMessage
            id="invite-join-platform"
            values={{
              organizationName,
            }}
          />
        </p>
        <Box mt={4}>
          <RegistrationForm query={query} />
        </Box>

        <SubmitButton id="confirm-register" label="create-account" isSubmitting={isSubmitting} className="btn-submit" />
      </ContentContainer>

      <LogoContainer bgColor={backgroundColor}>
        <Symbols />
        {logo.media?.url && <Image src={logo.media.url} alt={`logo ${organizationName}`} useDs />}
      </LogoContainer>
    </Container>
  )
}
export default UserInvitationPage
