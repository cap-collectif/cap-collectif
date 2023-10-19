// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import Providers from './Providers'
import environment, { graphqlError } from '../createRelayEnvironment'
import Loader from '../components/Ui/FeedbacksIndicators/Loader'
import type { RegistrationAdminAppQueryResponse } from '~relay/RegistrationAdminAppQuery.graphql'

const RegistrationAdminPage = lazy(
  () =>
    import(
      /* webpackChunkName: "RegistrationAdminPage" */
      '~/components/Admin/RegistrationAdminPage'
    ),
)

const renderRegistrationAdminPage = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: RegistrationAdminAppQueryResponse | null | undefined
}) => {
  if (error) {
    console.log(error) // eslint-disable-line no-console

    return graphqlError
  }

  if (props) {
    return <RegistrationAdminPage query={props} />
  }

  return <Loader />
}

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query RegistrationAdminAppQuery {
            ...RegistrationAdminPage_query
          }
        `}
        variables={{}}
        render={renderRegistrationAdminPage}
      />
    </Providers>
  </Suspense>
)
