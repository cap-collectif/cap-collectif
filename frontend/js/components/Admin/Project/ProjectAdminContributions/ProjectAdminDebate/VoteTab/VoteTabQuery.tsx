import * as React from 'react'
import { useQuery } from 'relay-hooks'
import { createFragmentContainer, graphql } from 'react-relay'
import isEqual from 'lodash/isEqual'
import type { VoteTabQueryResponse, VoteTabQueryVariables } from '~relay/VoteTabQuery.graphql'
import type { VoteTabQuery_debate } from '~relay/VoteTabQuery_debate.graphql'
import type { VoteTabQuery_debateStep } from '~relay/VoteTabQuery_debateStep.graphql'
import type { Query } from '~/types'
import VoteTab, { VOTE_PAGINATION } from './VoteTab'
import VoteHeaderTab from './VoteHeaderTab'
import type { ProjectAdminDebateParameters } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer'
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context'
import VoteHeaderTabPlaceholder from './VoteHeaderTabPlaceholder'
import Skeleton from '~ds/Skeleton'
import TablePlaceholder from '~ds/Table/placeholder'
import { Flex } from '@cap-collectif/ui'
type Props = {
  readonly debate: VoteTabQuery_debate | null | undefined
  readonly debateStep: VoteTabQuery_debateStep | null | undefined
}
type PropsQuery = Query & {
  props: VoteTabQueryResponse
}

const createQueryVariables = (
  debateId: string,
  stepId: string,
  parameters: ProjectAdminDebateParameters,
): VoteTabQueryVariables => ({
  debateId,
  stepId,
  count: VOTE_PAGINATION,
  cursor: null,
  isPublished: parameters.filters.vote.state === 'ALL' ? null : parameters.filters.vote.state === 'PUBLISHED',
})

const queryVote = graphql`
  query VoteTabQuery($debateId: ID!, $stepId: ID!, $count: Int!, $cursor: String, $isPublished: Boolean) {
    debate: node(id: $debateId) {
      ...VoteTab_debate @arguments(count: $count, cursor: $cursor, isPublished: $isPublished)
    }
    debateStep: node(id: $stepId) {
      ...VoteTab_debateStep
    }
  }
`
export const initialVariables = {
  count: VOTE_PAGINATION,
  cursor: null,
  isPublished: null,
}

const VoteTabQuery = ({ debate, debateStep }: Props) => {
  const { parameters } = useProjectAdminDebateContext()
  const queryVariablesWithParameters = createQueryVariables(debate?.id || '', debateStep?.id || '', parameters)
  const hasFilters: boolean = !isEqual(
    { ...initialVariables, debateId: debate?.id, stepId: debateStep?.id },
    queryVariablesWithParameters,
  )
  const { props: data }: PropsQuery = useQuery(queryVote, queryVariablesWithParameters, {
    fetchPolicy: 'store-or-network',
    skip: !hasFilters,
  })
  const dataDebate: any = !hasFilters ? debate : data?.debate
  const dataDebateStep: any = !hasFilters ? debateStep : data?.debateStep
  return (
    <Flex direction="column">
      <Skeleton
        isLoaded={!!debate && !!debateStep}
        placeholder={<VoteHeaderTabPlaceholder state={parameters.filters.vote.state} />}
      >
        {/* Flow doesn't understand that the component is only render when props are ready */}
        {!!debate && !!debateStep && <VoteHeaderTab debate={debate} debateStep={debateStep} />}
      </Skeleton>

      <Skeleton
        isLoaded={(hasFilters && !!data) || (!hasFilters && !!debate)}
        placeholder={<TablePlaceholder rowsCount={5} columnsCount={4} />}
      >
        <VoteTab debate={dataDebate} debateStep={dataDebateStep} />
      </Skeleton>
    </Flex>
  )
}

export default createFragmentContainer(VoteTabQuery, {
  debate: graphql`
    fragment VoteTabQuery_debate on Debate
    @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, isPublished: { type: "Boolean" }) {
      id
      ...VoteHeaderTab_debate
      ...VoteTab_debate @arguments(count: $count, cursor: $cursor, isPublished: $isPublished)
    }
  `,
  debateStep: graphql`
    fragment VoteTabQuery_debateStep on Step {
      id
      ...VoteTab_debateStep
      ...VoteHeaderTab_debateStep
    }
  `,
})
