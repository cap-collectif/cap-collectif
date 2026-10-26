import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, Flex, FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control, useWatch } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { fetchQuery, graphql } from 'react-relay'
import { FormValues } from '../ProposalFormModal.type'
import { isProposalLikeObjectType } from '@shared/constants/proposalStepObjectType'
import { environment } from '@utils/relay-environement'

type Props = {
  control: Control<FormValues>
  objectType: string
  titleHelpText: string | null
  proposalFormId: string
  suggestingSimilarProposals: boolean
}

const SEARCH_PROPOSALS_QUERY = graphql`
  query TitleInputSearchProposalsQuery($proposalFormId: ID!, $term: String!) {
    form: node(id: $proposalFormId) {
      ... on ProposalForm {
        proposals(term: $term, first: 5) {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }
`

const TitleInput: React.FC<Props> = ({
  control,
  objectType,
  titleHelpText,
  proposalFormId,
  suggestingSimilarProposals,
}) => {
  const intl = useIntl()
  const title = useWatch({ control, name: 'title' })
  const [suggestions, setSuggestions] = React.useState<Array<{ id: string; title: string; url: string }>>([])

  React.useEffect(() => {
    if (!suggestingSimilarProposals || !title.trim()) {
      setSuggestions([])
      return
    }

    let isCurrent = true
    const timeout = setTimeout(() => {
      fetchQuery(environment as any, SEARCH_PROPOSALS_QUERY, { proposalFormId, term: title })
        .toPromise()
        .then((response: any) => {
          if (isCurrent)
            setSuggestions(response.form?.proposals?.edges?.flatMap((edge: any) => (edge?.node ? [edge.node] : [])) ?? [])
        })
        .catch(() => {
          if (isCurrent) setSuggestions([])
        })
    }, 500)

    return () => {
      isCurrent = false
      clearTimeout(timeout)
    }
  }, [proposalFormId, suggestingSimilarProposals, title])

  const getTitleLabel = () => {
    if (isProposalLikeObjectType(objectType)) return 'global.title'
    if (objectType === 'OPINION') return 'opinion-title'
    return 'title'
  }

  return (
    <FormControl errorId="proposal_title-error" name="title" control={control}>
      <FormLabel
        id="label-proposal_title"
        htmlFor="proposal_title"
        label={intl.formatMessage({ id: getTitleLabel() })}
      />
      <FieldInput type="text" control={control} name="title" id="proposal_title" />
      {suggestions.length > 0 && (
        <Box mt={2} border="1px solid" borderColor="gray.200" borderRadius="normal" overflow="hidden">
          <Flex align="center" justify="space-between" gap={2} p={3} bg="gray.100" borderBottom="1px solid" borderColor="gray.200">
            <Text>
              {intl.formatMessage(
                { id: 'proposal.suggest_header' },
                { matches: suggestions.length, terms: title.trim().split(/\s+/).length },
              )}
            </Text>
            <Button variant="secondary" variantSize="small" onClick={() => setSuggestions([])}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Flex>
          {suggestions.map((suggestion, index) => (
            <Box
              key={suggestion.id}
              as="a"
              href={suggestion.url}
              target="_blank"
              rel="noopener noreferrer"
              display="block"
              color="text.primary"
              p={3}
              borderBottom={index === suggestions.length - 1 ? 'none' : '1px solid'}
              borderColor="gray.200"
            >
              {suggestion.title}
            </Box>
          ))}
        </Box>
      )}
      {titleHelpText && (
        <Text id="proposal_title-help" color="text.tertiary" fontSize="sm" mt={1}>
          {titleHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default TitleInput
