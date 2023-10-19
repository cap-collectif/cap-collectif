import * as React from 'react'
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay'
import { Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import type { ModalMembers_mailingList } from '~relay/ModalMembers_mailingList.graphql'
import '~relay/ModalMembers_mailingList.graphql'
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { ModalMembersQueryResponse } from '~relay/ModalMembersQuery.graphql'
import Members from '~/components/Admin/Emailing/ModalMembers/Members'
import Spinner from '~ds/Spinner/Spinner'
import Flex from '~ui/Primitives/Layout/Flex'
import type { GlobalState } from '~/types'

type Props = {
  onClose: () => void
  show: boolean
  mailingList: ModalMembers_mailingList | null | undefined // Not optional but flow doesn't understand
}

const renderMembers = ({
  error,
  props,
  isAdmin,
}: ReactRelayReadyState & {
  props: ModalMembersQueryResponse | null | undefined
  isAdmin: boolean
}) => {
  if (error) return graphqlError

  if (props) {
    const { mailingList } = props

    if (mailingList) {
      return <Members mailingList={mailingList} isAdmin={isAdmin} />
    }
  }

  return (
    <Flex direction="row" justify="center">
      <Spinner size="m" />
    </Flex>
  )
}

export const ModalMembers = ({ show, onClose, mailingList }: Props) => {
  const { user } = useSelector((state: GlobalState) => state.user)
  if (!mailingList) return null
  const { id, name } = mailingList
  const isAdmin = user ? user.isAdmin : false
  return (
    <ModalContainer animation={false} show={show} onHide={onClose} bsSize="small" aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ModalMembersQuery($count: Int, $cursor: String, $mailingListId: ID!, $isAdmin: Boolean!) {
              mailingList: node(id: $mailingListId) {
                ... on MailingList {
                  ...Members_mailingList @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin)
                }
              }
            }
          `}
          variables={{
            mailingListId: id,
            count: 10,
            isAdmin,
          }}
          render={({ error, props, retry }) =>
            renderMembers({
              error,
              props,
              retry,
              isAdmin,
            })
          }
        />
      </Modal.Body>
    </ModalContainer>
  )
}
export default createFragmentContainer(ModalMembers, {
  mailingList: graphql`
    fragment ModalMembers_mailingList on MailingList {
      id
      name
    }
  `,
})
