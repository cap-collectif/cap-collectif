// @ts-nocheck
import React from 'react'
import { RelayEnvironmentProvider } from 'relay-hooks'
import { graphql, QueryRenderer } from 'react-relay'
import AlertBoxApp from '~/startup/AlertBoxApp'
import environment, { graphqlError } from '~/createRelayEnvironment'
import HomePageProjectsSectionConfigurationPage from '~/components/Admin/Section/HomePageProjectsSectionConfigurationPage'
import Loader from '~ui/FeedbacksIndicators/Loader'
import type { HomePageProjectsSectionConfigurationAppQueryResponse } from '~relay/HomePageProjectsSectionConfigurationAppQuery.graphql'

const query = graphql`
  query HomePageProjectsSectionConfigurationAppQuery($first: Int!, $cursor: String) {
    homePageProjectsSectionConfiguration {
      ...HomePageProjectsSectionConfigurationPage_homePageProjectsSectionConfiguration
      ...HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration
    }
    ...HomePageProjectsSectionConfigurationPageDisplayMostRecent_query @arguments(first: $first, cursor: $cursor)
    ...HomePageProjectsSectionConfigurationPageDisplayCustom_query
  }
`
export default () => (
  <AlertBoxApp>
    <RelayEnvironmentProvider environment={environment}>
      <QueryRenderer
        environment={environment}
        query={query}
        variables={{
          first: 0,
          cursor: null,
        }}
        render={({
          error,
          props,
        }: ReactRelayReadyState & {
          props: HomePageProjectsSectionConfigurationAppQueryResponse | null | undefined
        }) => {
          if (error) {
            return graphqlError
          }

          if (props && props?.homePageProjectsSectionConfiguration) {
            return (
              <HomePageProjectsSectionConfigurationPage
                {...props}
                paginatedProjectsFragmentRef={props}
                allProjectsFragmentRef={props}
                homePageProjectsSectionConfigurationFragmentRef={props?.homePageProjectsSectionConfiguration}
              />
            )
          }

          return <Loader />
        }}
      />
    </RelayEnvironmentProvider>
  </AlertBoxApp>
)
