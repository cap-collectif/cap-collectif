import React from 'react'
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay'
import { ConsultationListQuery as ConsultationListQueryType } from '@relay/ConsultationListQuery.graphql'
import ConsultationList from '../ConsultationList/ConsultationList'
import withPageAuthRequired from '@utils/withPageAuthRequired'

export const CONSULTATION_LIST_QUERY = graphql`
  query ConsultationListQuery($count: Int!, $cursor: String, $term: String, $orderBy: ConsultationOrder) {
    viewer {
      ...ConsultationList_consultationOwner @arguments(count: $count, cursor: $cursor, term: $term, orderBy: $orderBy)
      organizations {
        ...ConsultationList_consultationOwner @arguments(count: $count, cursor: $cursor, term: $term, orderBy: $orderBy)
      }
    }
  }
`

type Props = {
  queryReference: PreloadedQuery<ConsultationListQueryType>
  term: string
  resetTerm: () => void
}

const ConsultationListQuery: React.FC<Props> = ({ queryReference, term, resetTerm }) => {
  const { viewer } = usePreloadedQuery<ConsultationListQueryType>(CONSULTATION_LIST_QUERY, queryReference)
  const organization = viewer?.organizations?.[0]
  const owner = organization ?? viewer
  const [orderBy, setOrderBy] = React.useState('DESC')

  return (
    <ConsultationList
      consultationOwner={owner}
      term={term}
      resetTerm={resetTerm}
      orderBy={orderBy}
      setOrderBy={setOrderBy}
    />
  )
}

export const getServerSideProps = withPageAuthRequired
export default ConsultationListQuery
