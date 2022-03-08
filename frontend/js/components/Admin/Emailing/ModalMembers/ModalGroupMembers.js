// @flow
import * as React from 'react';
import { useLazyLoadQuery, graphql, useFragment } from 'react-relay';
import { Modal } from 'react-bootstrap';
import { type ModalGroupMembers_groupList$key } from '~relay/ModalGroupMembers_groupList.graphql';
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style';
import GroupMembers from '~/components/Admin/Emailing/ModalMembers/GroupMembers';
import Spinner from '~ds/Spinner/Spinner';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  onClose: () => void,
  show: boolean,
  isAdmin: boolean,
  groupListRef: ?ModalGroupMembers_groupList$key,
|};

const FRAGMENT_GROUPLIST = graphql`
  fragment ModalGroupMembers_groupList on Group {
    id
    title
  }
`;

const QUERY = graphql`
  query ModalGroupMembersQuery(
    $count: Int
    $cursor: String
    $groupListId: ID!
    $isAdmin: Boolean!
  ) {
    groupList: node(id: $groupListId) {
      ... on Group {
        ...GroupMembers_groupList @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin)
      }
    }
  }
`;

export const ModalGroupMembers = ({ show, onClose, groupListRef, isAdmin }: Props) => {
  const groupList = useFragment(FRAGMENT_GROUPLIST, groupListRef);
  const query = useLazyLoadQuery(QUERY, { groupListId: groupList?.id, count: 10, isAdmin });
  if (!groupList) return null;
  return (
    <ModalContainer
      animation={false}
      show={show}
      onHide={onClose}
      bsSize="small"
      aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">{groupList?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {query ? (
          <GroupMembers groupList={query.groupList} isAdmin={isAdmin} />
        ) : (
          <Flex direction="row" justify="center">
            <Spinner size="m" />
          </Flex>
        )}
      </Modal.Body>
    </ModalContainer>
  );
};

export default ModalGroupMembers;
