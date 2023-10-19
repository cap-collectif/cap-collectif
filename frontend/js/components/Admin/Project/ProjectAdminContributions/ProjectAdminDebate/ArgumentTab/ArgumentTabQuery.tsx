import * as React from 'react'
import { useQuery } from 'relay-hooks'
import { createFragmentContainer, graphql } from 'react-relay'
import isEqual from 'lodash/isEqual'
import type { ArgumentTabQueryResponse, ArgumentTabQueryVariables } from '~relay/ArgumentTabQuery.graphql'
import type { ArgumentTabQuery_debate } from '~relay/ArgumentTabQuery_debate.graphql'
import type { ArgumentTabQuery_debateStep } from '~relay/ArgumentTabQuery_debateStep.graphql'
import type { Query } from '~/types'
import ArgumentTab, { ARGUMENT_PAGINATION } from './ArgumentTab'
import type { ProjectAdminDebateParameters } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer'
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context'
import Flex from '~ui/Primitives/Layout/Flex'
import ArgumentHeaderTab from './ArgumentHeaderTab'
import ArgumentHeaderTabPlaceholder from './ArgumentHeaderTabPlaceholder'
import ArgumentTabPlaceholder from './ArgumentTabPlaceholder'
import Skeleton from '~ds/Skeleton'
type Props = {
  readonly debate: ArgumentTabQuery_debate | null | undefined
  readonly debateStep: ArgumentTabQuery_debateStep | null | undefined
}
type PropsQuery = Query & {
  props: ArgumentTabQueryResponse
}

const createQueryVariables = (
  debateId: string,
  parameters: ProjectAdminDebateParameters,
): ArgumentTabQueryVariables => ({
  debateId,
  count: ARGUMENT_PAGINATION,
  cursor: null,
  value: parameters.filters.argument.type.length === 2 ? null : parameters.filters.argument.type[0],
  isPublished:
    parameters.filters.argument.state === 'TRASHED' ? null : parameters.filters.argument.state === 'PUBLISHED',
  isTrashed: parameters.filters.argument.state === 'TRASHED',
})

const queryArgument = graphql`
  query ArgumentTabQuery(
    $debateId: ID!
    $count: Int!
    $cursor: String
    $value: ForOrAgainstValue
    $isPublished: Boolean
    $isTrashed: Boolean!
  ) {
    debate: node(id: $debateId) {
      ...ArgumentTab_debate
        @arguments(count: $count, cursor: $cursor, value: $value, isPublished: $isPublished, isTrashed: $isTrashed)
    }
  }
`
export const initialVariables = {
  count: ARGUMENT_PAGINATION,
  cursor: null,
  value: null,
  isPublished: true,
  isTrashed: false,
}

const ArgumentTabQuery = ({ debate, debateStep }: Props) => {
  const { parameters } = useProjectAdminDebateContext()
  const queryVariablesWithParameters = createQueryVariables(debate?.id || '', parameters)
  const hasFilters: boolean = !isEqual({ ...initialVariables, debateId: debate?.id }, queryVariablesWithParameters)
  const { props: data }: PropsQuery = useQuery(queryArgument, queryVariablesWithParameters, {
    fetchPolicy: 'store-or-network',
    skip: !hasFilters,
  })
  const dataDebate: any = !hasFilters ? debate : data?.debate
  return (
    <Flex direction="column">
      <Skeleton
        isLoaded={!!debate && !!debateStep}
        placeholder={<ArgumentHeaderTabPlaceholder state={parameters.filters.argument.state} />}
      >
        {/* Flow doesn't understand that the component is only render when props are ready */}
        {!!debate && !!debateStep && debate.totalArguments.totalCount > 0 && (
          <ArgumentHeaderTab debate={debate} debateStep={debateStep} />
        )}
      </Skeleton>

      <Skeleton isLoaded={(hasFilters && !!data) || (!hasFilters && !!debate)} placeholder={<ArgumentTabPlaceholder />}>
        <ArgumentTab debate={dataDebate} />
      </Skeleton>
    </Flex>
  )
}

export default createFragmentContainer(ArgumentTabQuery, {
  debate: graphql`
    fragment ArgumentTabQuery_debate on Debate
    @argumentDefinitions(
      count: { type: "Int!" }
      cursor: { type: "String" }
      value: { type: "ForOrAgainstValue", defaultValue: null }
      isPublished: { type: "Boolean!" }
      isTrashed: { type: "Boolean!" }
    ) {
      id
      totalArguments: arguments(first: 0, isPublished: null, isTrashed: null) {
        totalCount
      }
      ...ArgumentTab_debate
        @arguments(count: $count, cursor: $cursor, value: $value, isPublished: $isPublished, isTrashed: $isTrashed)
      ...ArgumentHeaderTab_debate @arguments(isPublished: $isPublished, isTrashed: $isTrashed)
    }
  `,
  debateStep: graphql`
    fragment ArgumentTabQuery_debateStep on Step {
      ...ArgumentHeaderTab_debateStep
    }
  `,
})
