import * as React from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import { useSelector } from 'react-redux'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { MailParameterQueryQueryResponse } from '~relay/MailParameterQueryQuery.graphql'
import MailParameterPage from './MailParameterPage'
import Loader from '~ui/FeedbacksIndicators/Loader'
import type { GlobalState } from '~/types'

export type Props = {
  id: string
}

const renderComponent = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: MailParameterQueryQueryResponse | null | undefined
}) => {
  if (error) return graphqlError

  if (props?.emailingCampaign && props?.viewer) {
    const { emailingCampaign, viewer } = props
    return <MailParameterPage emailingCampaign={emailingCampaign} query={props} viewer={viewer} />
  }

  return <Loader />
}

const MailParameterQuery = ({ id }: Props) => {
  const { user } = useSelector((state: GlobalState) => state.user)
  const isAdmin = user ? user.isAdmin : false
  return (
    <QueryRenderer
      environment={environment}
      variables={{
        emailingCampaignId: id,
        mlAffiliations: isAdmin ? null : ['OWNER'],
        projectAffiliations: isAdmin ? null : ['OWNER'],
      }}
      query={graphql`
        query MailParameterQueryQuery(
          $emailingCampaignId: ID!
          $mlAffiliations: [MailingListAffiliation!]
          $projectAffiliations: [ProjectAffiliation!]
        ) {
          ...MailParameterPage_query
          emailingCampaign: node(id: $emailingCampaignId) {
            ... on EmailingCampaign {
              ...MailParameterPage_emailingCampaign
            }
          }
          viewer {
            ...MailParameterPage_viewer
              @arguments(mlAffiliations: $mlAffiliations, projectAffiliations: $projectAffiliations)
          }
        }
      `}
      render={renderComponent}
    />
  )
}

export default MailParameterQuery
