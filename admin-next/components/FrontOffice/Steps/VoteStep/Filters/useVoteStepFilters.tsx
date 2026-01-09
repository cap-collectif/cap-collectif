import { useVoteStepFilters_Query } from '@relay/useVoteStepFilters_Query.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

export type FilterState = {
  sort: string | null
  category: string | null
  theme: string | null
  status: string | null
  userType: string | null
  district: string | null
  contributor: string | null
  term: string | null
  latlng: string | null
  latlngBounds: string | null
}

export const DEFAULT_FILTERS: FilterState = {
  sort: 'random',
  category: 'ALL',
  theme: 'ALL',
  status: 'ALL',
  userType: 'ALL',
  district: 'ALL',
  contributor: 'ALL',
  term: null,
  latlng: null,
  latlngBounds: null,
}

const QUERY = graphql`
  query useVoteStepFilters_Query($stepId: ID!) {
    step: node(id: $stepId) {
      ... on ProposalStep {
        canDisplayBallot
        votesRanking
        voteType
        statuses {
          id
          name
        }
        proposals {
          totalCount
        }
        form {
          objectType
          commentable
          costable
          usingThemes
          usingDistrict
          usingCategories
          districts {
            id
            name
          }
          categories {
            id
            name
          }
        }
      }
    }
    ... on Query {
      themes {
        id
        title
      }
      userTypes {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  }
`

export type FilterOptions = ReadonlyArray<{
  id: string
  name?: string
  title?: string
}>

type FilterType = 'sort' | 'userType' | 'theme' | 'category' | 'district' | 'status'

type Filter = {
  isEnabled: boolean
  options: FilterOptions
  label: string
}

export type Filters = Record<FilterType, Filter>

type ReturnType = {
  totalCount: number
  filters: Filters
} | null

export const useVoteStepFilters = (stepId: string): ReturnType => {
  const intl = useIntl()
  const data = useLazyLoadQuery<useVoteStepFilters_Query>(QUERY, { stepId }, { fetchPolicy: 'store-or-network' })

  const themes = data?.themes || []
  const userTypes = data?.userTypes?.edges?.map(edge => edge.node) || []

  const userTypeEnabled = useFeatureFlag('user_type')
  const districtsEnabled = useFeatureFlag('districts')
  const themesEnabled = useFeatureFlag('themes')

  if (!data || !data?.step || !data?.step?.form || !data?.step?.proposals) return null
  const { step } = data
  const { form } = step
  const { proposals } = step

  const generateAllOption = (translationKey: string) => ({
    id: 'ALL',
    name: intl.formatMessage({
      id: translationKey,
    }),
  })

  const getSortOptions = () => {
    const orderByVotes = step.voteType !== 'DISABLED'
    const orderByPoints = step.votesRanking
    const orderByComments = form?.commentable
    const orderByCost = form?.costable
    const isOpinion = form?.objectType === 'OPINION'
    const filterPrefix = isOpinion ? 'global.filter' : 'global.filter_f'
    const options = [
      {
        id: 'random',
        title: intl.formatMessage({
          id: `${filterPrefix}_random`,
        }),
      },
      {
        id: 'last',
        title: intl.formatMessage({
          id: `${filterPrefix}_last`,
        }),
      },
      {
        id: 'old',
        title: intl.formatMessage({
          id: `${filterPrefix}_old`,
        }),
      },
    ]

    if (orderByComments) {
      options.push({
        id: 'comments',
        title: intl.formatMessage({
          id: `${filterPrefix}_comments`,
        }),
      })
    }

    if (orderByCost) {
      options.push(
        {
          id: 'expensive',
          title: intl.formatMessage({
            id: `${filterPrefix}_expensive`,
          }),
        },
        {
          id: 'cheap',
          title: intl.formatMessage({
            id: `${filterPrefix}_cheap`,
          }),
        },
      )
    }

    if (orderByVotes && step.canDisplayBallot) {
      options.push(
        {
          id: 'votes',
          title: intl.formatMessage({
            id: `${filterPrefix}_votes`,
          }),
        },
        {
          id: 'least-votes',
          title: intl.formatMessage({
            id: `${filterPrefix}_least-votes`,
          }),
        },
      )
    }

    if (orderByPoints && step.canDisplayBallot) {
      options.push(
        {
          id: 'points',
          title: intl.formatMessage({
            id: `${filterPrefix}_points`,
          }),
        },
        {
          id: 'least-points',
          title: intl.formatMessage({
            id: `${filterPrefix}_least-points`,
          }),
        },
      )
    }

    return options
  }

  const filters: Filters = {
    sort: {
      isEnabled: true,
      options: getSortOptions(),
      label: intl.formatMessage({
        id: 'sort-by',
      }),
    },
    userType: {
      isEnabled: userTypeEnabled && userTypes.length > 0,
      options: [generateAllOption('global.select_types'), ...userTypes],
      label: intl.formatMessage({
        id: 'global.contributors',
      }),
    },
    theme: {
      isEnabled: (themesEnabled && form?.usingThemes && (themes?.length ?? 0) > 0) ?? false,
      options: [generateAllOption('global.select_themes'), ...themes],
      label: intl.formatMessage({
        id: 'main-theme',
      }),
    },
    category: {
      isEnabled: (form?.usingCategories && (form?.categories?.length ?? 0) > 0) ?? false,
      options: form?.categories ? [generateAllOption('global.select_categories'), ...form?.categories] : [],
      label: intl.formatMessage({
        id: 'secondary-theme',
      }),
    },
    district: {
      isEnabled: districtsEnabled && (form?.districts?.length ?? 0) > 0,
      options: form?.districts ? [generateAllOption('global.select_districts'), ...form?.districts] : [],
      label: intl.formatMessage({
        id: 'proposal_form.districts',
      }),
    },
    status: {
      isEnabled: (step.statuses?.length ?? 0) > 0,
      options: step.statuses ? [generateAllOption('global.select_statuses'), ...step.statuses] : [],
      label: intl.formatMessage({
        id: 'global.statuses',
      }),
    },
  }
  return {
    totalCount: proposals?.totalCount ?? 0,
    filters,
  }
}
export default useVoteStepFilters
