import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { LoginButtonQueryWrapper } from '@shared/login/LoginButton'
import LoginBox from '@shared/login/LoginBox'
import { RegistrationButtonQueryWrapper } from '@shared/register/RegistrationButton'
import { ShieldPageQuery, ShieldPageQuery$data } from '@relay/ShieldPageQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import LoginFormWrapper from '@shared/login/LoginFormWrapper'
import { useFormContext } from 'react-hook-form'
import { Button } from '@cap-collectif/ui'

type Props = {
  loginWithOpenId: boolean
  query: ShieldPageQuery$data
}

const QUERY = graphql`
  query ShieldPageQuery {
    ...LoginBox_query
    oauth2sso: ssoConfigurations(ssoType: OAUTH2) {
      edges {
        node {
          enabled
        }
      }
    }
  }
`

const SimpleShieldForm = ({ query }: { query: ShieldPageQuery$data }) => {
  const intl = useIntl()
  const {
    formState: { isSubmitting },
  } = useFormContext()

  return (
    <>
      <LoginBox query={query} />
      <Button
        variant="primary"
        id="confirm-login"
        type="submit"
        isLoading={isSubmitting}
        mt={4}
        width="100%"
        justifyContent="center"
      >
        {intl.formatMessage({ id: isSubmitting ? 'global.loading' : 'global.login_me' })}
      </Button>
    </>
  )
}

export const ShieldBody = ({ query, loginWithOpenId }: Props) => {
  const byPassAuth = useFeatureFlag('sso_by_pass_auth')
  const showRegistration = useFeatureFlag('registration')

  if (showRegistration && !loginWithOpenId) {
    return (
      <>
        <LoginButtonQueryWrapper justifyContent="center" width="100%" mb={2} />
        <RegistrationButtonQueryWrapper justifyContent="center" width="100%" />
      </>
    )
  }

  if (byPassAuth) return <LoginBox query={query} />

  return (
    <LoginFormWrapper>
      <SimpleShieldForm query={query} />
    </LoginFormWrapper>
  )
}

export const ShieldPage = () => {
  const query = useLazyLoadQuery<ShieldPageQuery>(QUERY, {})

  return (
    <div id="shield-agent" className="bg-white col-md-4 col-md-offset-4 panel panel-default">
      <div className="panel-body">
        <ShieldBody query={query} loginWithOpenId={query.oauth2sso.edges.some(({ node }) => node.enabled)} />
      </div>
    </div>
  )
}

export default ShieldPage
