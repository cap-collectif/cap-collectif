// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import Providers from './Providers'
import Loader from '../components/Ui/FeedbacksIndicators/Loader'
import environment, { graphqlError } from '../createRelayEnvironment'
import type { ContactAdminPageAppQueryResponse } from '~relay/ContactAdminPageAppQuery.graphql'

const ContactAdminPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ContactAdminPage" */
      '~/components/Admin/Contact/ContactAdminPage'
    ),
)

const renderContactAdminPage = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: ContactAdminPageAppQueryResponse | null | undefined
}) => {
  if (error) {
    console.log(error) // eslint-disable-line no-console

    return graphqlError
  }

  if (props) {
    return <ContactAdminPage query={props} />
  }

  return <Loader />
}

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ContactAdminPageAppQuery {
            ...ContactAdminPage_query
          }
        `}
        variables={{}}
        render={renderContactAdminPage}
      />
    </Providers>
  </Suspense>
)
