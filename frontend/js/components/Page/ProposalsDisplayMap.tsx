import React, { useEffect, useState } from 'react'
import type { RelayPaginationProp } from 'react-relay'
import { createPaginationContainer, graphql } from 'react-relay'
import type { MapOptions } from '../Proposal/Map/Map.types'
import type { GeoJson } from '~/utils/geojson'
import '~/utils/geojson'
import ProposalLeafletMap from '../Proposal/Map/ProposalLeafletMap'
import type { ProposalsDisplayMap_step } from '~relay/ProposalsDisplayMap_step.graphql'
type RelayProps = {
  readonly step: ProposalsDisplayMap_step
}
type Props = RelayProps & {
  readonly relay: RelayPaginationProp
  readonly geoJsons?: Array<GeoJson>
  readonly defaultMapOptions: MapOptions
}
const PAGINATION = 50
let hasMore = false
export const ProposalsDisplayMap = ({ step, relay, ...rest }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  hasMore = step.proposals?.pageInfo.hasNextPage || false
  const projectType = step.project && step.project.type ? step.project.type.title : null

  const loadMore = () => {
    if (!hasMore) {
      setIsLoading(false)
      return
    }

    relay.loadMore(PAGINATION, (error: Error | null | undefined) => {
      if (error) setHasError(true)
      else loadMore()
    })
  }

  const retry = () => {
    setHasError(false)
    relay.refetchConnection(PAGINATION, (error: Error | null | undefined) => {
      if (error) setHasError(true)
      else loadMore()
    })
  }

  useEffect(() => {
    if (step.proposals.pageInfo.hasNextPage) {
      setIsLoading(step.proposals.pageInfo.hasNextPage)
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return step.proposals && step.proposals.edges ? (
    <ProposalLeafletMap
      projectType={projectType}
      proposals={step.proposals.edges.filter(Boolean).map(edge => edge.node)}
      proposalForm={step.form}
      isLoading={isLoading}
      hasMore={hasMore}
      hasError={hasError}
      proposalInAZoneRequired={step.form?.proposalInAZoneRequired}
      retry={retry}
      isCollectStep={step.form && step.kind === 'collect'}
      {...rest}
    />
  ) : null
}
export default createPaginationContainer(
  ProposalsDisplayMap,
  {
    step: graphql`
      fragment ProposalsDisplayMap_step on ProposalStep {
        kind
        form {
          proposalInAZoneRequired
          ...ProposalLeafletMap_proposalForm
        }
        project {
          type {
            title
          }
        }
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          term: $term
          district: $district
          theme: $theme
          category: $category
          status: $status
          userType: $userType
          state: $state
        ) @connection(key: "ProposalsDisplayMap_proposals", filters: []) {
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
          edges {
            node {
              id
              ...ProposalLeafletMap_proposals
              ...ProposalMapPopover_proposal
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor }
    },

    query: graphql`
      query ProposalsDisplayMapQuery(
        $stepId: ID!
        $cursor: String
        $count: Int
        $orderBy: [ProposalOrder]
        $term: String
        $district: ID
        $category: ID
        $status: ID
        $theme: ID
        $userType: ID
        $state: ProposalsState
      ) {
        step: node(id: $stepId) {
          ...ProposalsDisplayMap_step
        }
      }
    `,
  },
)
