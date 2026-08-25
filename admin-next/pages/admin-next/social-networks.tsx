import * as React from 'react'
import { FC, Suspense } from 'react'
import { GetServerSideProps } from 'next'
import { useIntl } from 'react-intl'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired, { redirectOnError } from '@utils/withPageAuthRequired'
import SocialNetworkList from '@components/BackOffice/SocialNetwork/SocialNetworkList'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

const SocialNetworks: FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.social_network' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <SocialNetworkList />
      </Suspense>
    </Layout>
  )
}

// This page manages a global platform setting under Sonata's default `^/admin` access control,
// which requires strict ROLE_ADMIN. `withPageAuthRequired` alone is not enough here since it also
// lets project admins/organization members/mediators through.
export const getServerSideProps: GetServerSideProps = async context => {
  const result = await withPageAuthRequired(context)

  if (!('props' in result)) {
    return result
  }

  const props = await result.props
  if (!props.viewerSession?.isAdmin) {
    return redirectOnError(context.res, 'Access denied: the social networks page requires the ROLE_ADMIN role.')
  }

  return { props }
}

export default SocialNetworks
