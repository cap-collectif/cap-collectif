import * as React from 'react'
import { Modal } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { graphql } from 'react-relay'
import { useQuery } from 'relay-hooks'
import Text from '~ui/Primitives/Text'
import Heading from '~ui/Primitives/Heading'
import AppBox from '~ui/Primitives/AppBox'
import Flex from '~ui/Primitives/Layout/Flex'
import ModalResponseTagSearchResultsList from '~/components/Questionnaire/ModalResponseTagSearchResultsList'
type Props = {
  readonly questionId: string
  readonly show: boolean
  readonly onClose: () => void
  readonly searchTag: {
    value: string
    count: number
  }
}
const QUERY = graphql`
  query ModalResponseTagSearchResultsQuery($questionId: ID!, $term: String!, $first: Int!, $cursor: String) {
    ...ModalResponseTagSearchResultsList_query
      @arguments(questionId: $questionId, term: $term, first: $first, cursor: $cursor)
  }
`

const Loader = () => (
  <Flex mb={1} direction="column" backgroundColor="gray.100" borderRadius="4px" p={4}>
    <AppBox backgroundColor="gray.150" borderRadius="4px" width="100%" mb={2} height="12px" />
    <AppBox backgroundColor="gray.150" borderRadius="4px" width="100%" height="12px" />
  </Flex>
)

const ModalResponseTagSearchResults = ({ show, onClose, questionId, searchTag }: Props) => {
  const { props } = useQuery(
    QUERY,
    {
      questionId,
      term: searchTag.value,
      first: 4,
    },
    {
      fetchPolicy: 'store-or-network',
    },
  )
  return (
    <Modal animation={false} show={show} onHide={onClose} bsSize="medium" aria-labelledby="contained-modal-title-lg">
      <Heading
        as="h4"
        textAlign="center"
        p={4}
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
      >
        <FormattedMessage
          id="tag-cloud-answer-number"
          values={{
            count: searchTag.count,
          }}
        />
        <Text ml={2} fontWeight="600">{` "${searchTag.value}"`}</Text>
      </Heading>
      <Modal.Body
        style={{
          padding: '24px',
          overflow: 'scroll',
          maxHeight: '80vh',
        }}
      >
        {!props ? (
          <>
            <Loader />
            <Loader />
            <Loader />
          </>
        ) : (
          <ModalResponseTagSearchResultsList query={props} value={searchTag.value} />
        )}
      </Modal.Body>
    </Modal>
  )
}

export default ModalResponseTagSearchResults
