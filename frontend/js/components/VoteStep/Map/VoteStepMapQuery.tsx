import * as React from 'react'
import { useLazyLoadQuery, graphql } from 'react-relay'
import type { VoteStepMapQueryQuery as VoteStepMapQueryQueryType } from '~relay/VoteStepMapQueryQuery.graphql'
import VoteStepMap from './VoteStepMap'
import type { MapCenterObject } from '~/components/Proposal/Map/Map.types'
import { useVoteStepContext } from '../Context/VoteStepContext'
import { getOrderByArgs, parseLatLngBounds } from '../utils'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { useSelector } from 'react-redux'
import { State } from '~/types'

const QUERY = graphql`
  query VoteStepMapQueryQuery(
    $stepId: ID!
    $count: Int!
    $orderBy: [ProposalOrder]
    $cursor: String
    $userType: ID
    $theme: ID
    $category: ID
    $district: ID
    $status: ID
    $geoBoundingBox: GeoBoundingBox
    $term: String
    $isAuthenticated: Boolean!
  ) {
    viewer @include(if: $isAuthenticated) {
      ...VoteStepMap_viewer @arguments(stepId: $stepId)
    }
    voteStep: node(id: $stepId) {
      ... on ProposalStep {
        open
        form {
          mapCenter {
            lat
            lng
          }
          zoomMap
        }
        ...VoteStepMap_step
          @arguments(
            count: $count
            cursor: $cursor
            orderBy: $orderBy
            userType: $userType
            theme: $theme
            category: $category
            district: $district
            status: $status
            geoBoundingBox: $geoBoundingBox
            term: $term
            isAuthenticated: $isAuthenticated
            stepId: $stepId
          )
      }
    }
  }
`

type Props = {
  readonly stepId: string
  readonly handleMapPositionChange: (arg0: string) => void
  readonly urlCenter: MapCenterObject | null
}

export const VoteStepMapQuery = ({ stepId, handleMapPositionChange, urlCenter }: Props) => {
  const { filters } = useVoteStepContext()
  const isMobile = useIsMobile()
  const isAuthenticated = useSelector((state: State) => state.user.user !== null)

  const { sort, userType, theme, category, district, status, term, latlngBounds } = filters
  const geoBoundingBox = !isMobile && latlngBounds ? parseLatLngBounds(latlngBounds) : null
  const data = useLazyLoadQuery<VoteStepMapQueryQueryType>(
    QUERY,
    {
      stepId,
      count: 50,
      cursor: null,
      orderBy: getOrderByArgs(sort) || [
        {
          field: 'RANDOM',
          direction: 'ASC',
        },
      ],
      userType: userType || null,
      theme: theme || null,
      category: category || null,
      district: district || null,
      status: status || null,
      geoBoundingBox,
      term: term || null,
      isAuthenticated,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  )
  if (!data || !data.voteStep) return null
  const { voteStep } = data
  const DEFAULT_CENTER = {
    lat: voteStep.form?.mapCenter?.lat || 48.8586047,
    lng: voteStep.form?.mapCenter?.lng || 2.3137325,
    zoom: voteStep.form?.zoomMap || 10,
  }
  return (
    <VoteStepMap
      voteStep={voteStep}
      viewer={data.viewer}
      handleMapPositionChange={handleMapPositionChange}
      urlCenter={urlCenter}
      DEFAULT_CENTER={DEFAULT_CENTER}
      stepId={stepId}
      disabled={!voteStep?.open}
    />
  )
}
export default VoteStepMapQuery
