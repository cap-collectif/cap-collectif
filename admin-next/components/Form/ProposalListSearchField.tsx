import * as React from 'react'
import { fetchQuery, graphql } from 'react-relay'
import type {
  ProposalListSearchFieldQuery,
  ProposalListSearchFieldQueryResponse,
} from '@relay/ProposalListSearchFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { Box, FormLabel, Search } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

type ProposalListSearchFieldValue = {
  label: string
  value: string
  media: string | null
}

type ProposalListSearchFieldProps = {
  onSelect: (data: ProposalListSearchFieldValue) => void
  label?: string
  stepId: string
  selectedIds: string[]
}

const getProposalList = graphql`
  query ProposalListSearchFieldQuery($term: String, $stepId: ID!) {
    node(id: $stepId) {
      ... on SelectionStep {
        proposals(term: $term, reference: $term) {
          edges {
            node {
              id
              title
              media {
                url(format: "reference")
              }
            }
          }
        }
      }
    }
  }
`

const formatProposalsData = (proposals: ProposalListSearchFieldQueryResponse['node']['proposals']) => {
  if (!proposals) return []
  return (
    proposals.edges
      ?.map(edge => edge?.node)
      ?.map(d => ({ value: d?.id ?? '', label: d?.title ?? '', media: d.media?.url })) || []
  )
}

export const ProposalListSearchField: React.FC<ProposalListSearchFieldProps> = ({
  label,
  onSelect,
  stepId,
  selectedIds,
}) => {
  const ref = React.useRef()
  const intl = useIntl()
  const [term, setTerm] = React.useState('')
  const [menuIsOpen, setMenuIsOpen] = React.useState(true)

  const loadOptions = async (term: string): Promise<ProposalListSearchFieldValue[]> => {
    const proposalsData = await fetchQuery<ProposalListSearchFieldQuery>(environment, getProposalList, {
      term,
      stepId,
    }).toPromise()

    if (proposalsData?.node?.proposals) {
      return formatProposalsData(proposalsData.node.proposals) as ProposalListSearchFieldValue[]
    }

    return []
  }

  React.useEffect(() => {
    // @ts-expect-error focus is not generic
    if (ref.current) setTimeout(() => ref.current?.focus(), 100)
  }, [ref])

  return (
    <Box
      sx={{
        '.cap-search__single-value': { display: 'none' },
        '.cap-search__menu': { display: term.length > 1 ? 'block' : 'none' },
      }}
    >
      {label ? <FormLabel mb={1} label={label} /> : null}
      <Search
        onSelect={data => {
          onSelect(data as ProposalListSearchFieldValue)
          setTerm('')
          setTimeout(() => {
            // @ts-expect-error focus is not generic
            if (ref.current) ref.current?.focus()
          }, 100)
        }}
        inputId="searchProposals"
        loadOptions={loadOptions}
        filterOption={proposal => !selectedIds.includes(proposal.value)}
        defaultOptions
        width="100%"
        placeholder=""
        onChange={term => {
          setTerm(term)
        }}
        onBlur={() => setMenuIsOpen(false)}
        onFocus={() => setMenuIsOpen(true)}
        value={term}
        ref={ref}
        menuIsOpen={menuIsOpen}
        noOptionsMessage={() => intl.formatMessage({ id: 'result-not-found' })}
        loadingMessage={() => intl.formatMessage({ id: 'global.loading' })}
        menuPortalTarget={undefined}
      />
    </Box>
  )
}

export default ProposalListSearchField
