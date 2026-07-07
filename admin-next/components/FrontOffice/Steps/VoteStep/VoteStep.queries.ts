import type { VoteStepPostCreateRefreshQuery } from '@relay/VoteStepPostCreateRefreshQuery.graphql'
import type { VoteStepQuery } from '@relay/VoteStepQuery.graphql'
import { exportLatLngBounds } from '@utils/leaflet'
import { graphql } from 'react-relay'

export const DEFAULT_SORT = 'random'
export const DEFAULT_FILTER = 'ALL'
export const VOTE_STEP_PROPOSALS_COUNT = 50

type VoteStepSearchParams = {
  sort?: string | null
  category?: string | null
  theme?: string | null
  status?: string | null
  userType?: string | null
  district?: string | null
  term?: string | null
  latlngBounds?: string | null
}

type VoteStepQueryVariablesInput = {
  stepId: string
  isAuthenticated: boolean
  searchParams: VoteStepSearchParams
}

export const VOTE_STEP_QUERY = graphql`
  query VoteStepQuery(
    $term: String
    $orderBy: [ProposalOrder]
    $stepId: ID!
    $userType: ID
    $theme: ID
    $category: ID
    $district: ID
    $status: ID
    $isAuthenticated: Boolean!
  ) {
    step: node(id: $stepId) {
      id
      ... on ProposalStep {
        ...VoteStepWebLayout_proposalStep
          @arguments(
            count: 50
            term: $term
            orderBy: $orderBy
            userType: $userType
            theme: $theme
            category: $category
            district: $district
            status: $status
            isAuthenticated: $isAuthenticated
          )
      }
    }
  }
`

export const VOTE_STEP_POST_CREATE_REFRESH_QUERY = graphql`
  query VoteStepPostCreateRefreshQuery(
    $term: String
    $orderBy: [ProposalOrder]
    $stepId: ID!
    $userType: ID
    $theme: ID
    $category: ID
    $district: ID
    $status: ID
    $geoBoundingBox: GeoBoundingBox
    $isAuthenticated: Boolean!
  ) {
    step: node(id: $stepId) {
      id
      ... on ProposalStep {
        ...VoteStepWebLayout_proposalStep
          @arguments(
            count: 50
            term: $term
            orderBy: $orderBy
            userType: $userType
            theme: $theme
            category: $category
            district: $district
            status: $status
            geoBoundingBox: $geoBoundingBox
            isAuthenticated: $isAuthenticated
          )
      }
    }
  }
`

const getOrderByArgs = (sort: string | null) => {
  if (!sort) return null

  const sortBy = {
    random: {
      field: 'RANDOM',
      direction: 'ASC',
    },
    last: {
      field: 'PUBLISHED_AT',
      direction: 'DESC',
    },
    old: {
      field: 'PUBLISHED_AT',
      direction: 'ASC',
    },
    comments: {
      field: 'COMMENTS',
      direction: 'DESC',
    },
    expensive: {
      field: 'COST',
      direction: 'DESC',
    },
    cheap: {
      field: 'COST',
      direction: 'ASC',
    },
    votes: {
      field: 'VOTES',
      direction: 'DESC',
    },
    'least-votes': {
      field: 'VOTES',
      direction: 'ASC',
    },
    points: {
      field: 'POINTS',
      direction: 'DESC',
    },
    'least-points': {
      field: 'POINTS',
      direction: 'ASC',
    },
  }

  const orderBy = sortBy[sort]

  if (!orderBy) return null

  return [orderBy]
}

export const normalizeVoteStepSearchParams = (searchParams: VoteStepSearchParams) => ({
  sort: searchParams.sort || DEFAULT_SORT,
  category: searchParams.category || DEFAULT_FILTER,
  theme: searchParams.theme || DEFAULT_FILTER,
  status: searchParams.status || DEFAULT_FILTER,
  userType: searchParams.userType || DEFAULT_FILTER,
  district: searchParams.district || DEFAULT_FILTER,
  term: searchParams.term || undefined,
  latlngBounds: searchParams.latlngBounds || undefined,
})

export const buildVoteStepQueryVariables = ({
  stepId,
  isAuthenticated,
  searchParams,
}: VoteStepQueryVariablesInput): VoteStepQuery['variables'] | VoteStepPostCreateRefreshQuery['variables'] => {
  const filters = normalizeVoteStepSearchParams(searchParams)

  let geoBoundingBox

  if (filters.latlngBounds) {
    try {
      geoBoundingBox = exportLatLngBounds(filters.latlngBounds)
    } catch (error) {
      geoBoundingBox = undefined
    }
  }

  return {
    stepId,
    term: filters.term,
    orderBy: getOrderByArgs(filters.sort) || [
      {
        field: 'RANDOM',
        direction: 'ASC',
      },
    ],
    isAuthenticated,
    userType: filters.userType === DEFAULT_FILTER ? undefined : filters.userType,
    theme: filters.theme === DEFAULT_FILTER ? undefined : filters.theme,
    category: filters.category === DEFAULT_FILTER ? undefined : filters.category,
    district: filters.district === DEFAULT_FILTER ? undefined : filters.district,
    status: filters.status === DEFAULT_FILTER ? undefined : filters.status,
    geoBoundingBox,
  }
}
