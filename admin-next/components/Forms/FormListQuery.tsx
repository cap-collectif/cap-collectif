import * as React from 'react'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { useAppContext } from '../AppProvider/App.context'
import type { FormListQuery as FormListQueryType } from '@relay/FormListQuery.graphql'
import FormListPage from './FormListPage'

export const QUERY: GraphQLTaggedNode = graphql`
  query FormListQuery(
    $term: String
    $proposalFormAffiliations: [ProposalFormAffiliation!]
    $questionnaireAffiliations: [QuestionnaireAffiliation!]
  ) {
    viewer {
      ...FormListPage_viewer
        @arguments(
          term: $term
          proposalFormAffiliations: $proposalFormAffiliations
          questionnaireAffiliations: $questionnaireAffiliations
        )
    }
  }
`

export type Affiliations = Array<'OWNER'> | null

const FormListQuery: React.FC = () => {
  const { viewerSession } = useAppContext()
  const affiliations: Affiliations = viewerSession.isAdmin ? null : ['OWNER']
  const query = useLazyLoadQuery<FormListQueryType>(QUERY, {
    proposalFormAffiliations: affiliations,
    questionnaireAffiliations: affiliations,
  })
  const { viewer } = query

  return <FormListPage viewer={viewer} affiliations={affiliations} />
}

export default FormListQuery
