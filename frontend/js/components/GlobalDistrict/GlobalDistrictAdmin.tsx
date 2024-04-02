import * as React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment, { graphqlError } from '~/createRelayEnvironment'
import Loader from '~/components/Ui/FeedbacksIndicators/Loader'
import type { GlobalDistrictAdminPageQuery$data } from '~relay/GlobalDistrictAdminPageQuery.graphql'
import GlobalDistrictAdminPage from './GlobalDistrictAdminPage'

export default function GlobalDistrictAdmin() {
  return (
    <QueryRenderer
      environment={environment as any}
      query={graphql`
        query GlobalDistrictAdminPageQuery {
          districts: globalDistricts(first: 1000) @connection(key: "GlobalDistrictAdminPage_districts") {
            ...GlobalDistrictAdminPage_districts
            edges {
              node {
                id
              }
            }
          }
        }
      `}
      variables={{}}
      render={({
        error,
        props: queryProps,
      }: ReactRelayReadyState & {
        props: GlobalDistrictAdminPageQuery$data | null | undefined
      }) => {
        if (error) {
          return graphqlError
        }

        if (!queryProps) {
          return <Loader />
        }

        return <GlobalDistrictAdminPage {...queryProps} />
      }}
    />
  )
}
