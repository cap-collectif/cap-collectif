// @ts-nocheck
import React from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import environment, { graphqlError } from '~/createRelayEnvironment'
import HomePageProjectsMapSectionConfigurationPage from '~/components/Admin/Section/HomePageProjectsMapSectionConfigurationPage'
import Loader from '~ui/FeedbacksIndicators/Loader'
import type { HomePageProjectsMapSectionConfigurationAppQueryResponse } from '~relay/HomePageProjectsMapSectionConfigurationAppQuery.graphql'
import Providers from '~/startup/Providers'

const query = graphql`
  query HomePageProjectsMapSectionConfigurationAppQuery {
    homePageProjectsMapSectionConfiguration {
      ...HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration
    }
    globalDistricts {
      totalCount
    }
  }
`
export default () => (
  <Providers>
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
        props: HomePageProjectsMapSectionConfigurationAppQueryResponse | null | undefined
      }) => {
        if (error) {
          return graphqlError
        }

        if (props && props?.homePageProjectsMapSectionConfiguration) {
          return (
            <HomePageProjectsMapSectionConfigurationPage
              {...props}
              homePageProjectsMapSectionConfigurationFragmentRef={props?.homePageProjectsMapSectionConfiguration}
              hasDistrict={props?.globalDistricts.totalCount > 0}
            />
          )
        }

        return <Loader />
      }}
    />
  </Providers>
)
