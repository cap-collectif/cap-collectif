import React from 'react'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { LoginForm } from '@shared/login/LoginForm'
import { LoginBox_query$key } from '@relay/LoginBox_query.graphql'
import { Box } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import LoginSocialButtons from './LoginSocialButtons'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

type Props = {
  query: LoginBox_query$key
}

const FRAGMENT = graphql`
  fragment LoginBox_query on Query {
    textTop: siteParameter(keyname: "login.text.top") {
      value
    }
    textBottom: siteParameter(keyname: "login.text.bottom") {
      value
    }
    ...LoginSocialButtons_query
  }
`

export const LoginBox = ({ query: queryRef }: Props) => {
  const query = useFragment(FRAGMENT, queryRef)
  const byPassAuth = useFeatureFlag('sso_by_pass_auth')

  return (
    <div>
      {query.textTop?.value && (
        <Box
          textAlign="center"
          p={4}
          borderRadius="normal"
          border="normal"
          backgroundColor="primary.background"
          borderColor="primary.light"
          color="primary.base"
          mb={4}
        >
          <WYSIWYGRender value={query.textTop.value} />
        </Box>
      )}
      <LoginSocialButtons query={query} />
      {!byPassAuth && <LoginForm />}
      {query.textBottom?.value ? (
        <Box mt={4} textAlign="center" color="neutral-gray.600">
          <WYSIWYGRender value={query.textBottom.value} />
        </Box>
      ) : null}
    </div>
  )
}

export default LoginBox
