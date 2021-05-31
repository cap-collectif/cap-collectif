// @flow
import React from 'react';
import {FormattedMessage, useIntl} from "react-intl";
import styled from "styled-components";
import {graphql, usePaginationFragment} from "react-relay";
import {Button, ListGroupItem} from "react-bootstrap";
import Text from "~ui/Primitives/Text";
import AppBox from "~ui/Primitives/AppBox";
import colors from "~/styles/modules/colors";
import type {GroupAdminPendingInvitationsList_group$key} from "~relay/GroupAdminPendingInvitationsList_group.graphql";
import Loader from "~ui/FeedbacksIndicators/Loader";

const UserInvitePendingList = styled(AppBox)`
  border: 1px solid ${colors.gray['200']};
  border-radius: 4px;
  padding: 16px;
`

const FRAGMENT = graphql`
  fragment GroupAdminPendingInvitationsList_group on Group
    @argumentDefinitions(countInvitations: { type: "Int" }, cursorInvitations: { type: "String" })
    @refetchable(queryName: "GroupAdminPendingInvitationsListGroup")
    {
      pendingInvitations(first: $countInvitations, after: $cursorInvitations)
      @connection(key: "GroupAdminPendingInvitationsList_pendingInvitations")
      {
        edges {
          node {
              email
              isAdmin
          }
        }
      }
    }
`;

type Props = {|
  +pendingInvitationFragmentRef: GroupAdminPendingInvitationsList_group$key
|};

const GroupAdminPendingInvitationsList = ({pendingInvitationFragmentRef}: Props) => {

  const intl = useIntl();

  const { data: group, hasNext, loadNext, isLoadingNext } = usePaginationFragment(FRAGMENT, pendingInvitationFragmentRef);

  return (
    <>
      <h3 className="box-title">{intl.formatMessage({id: 'invitation.pending'})}</h3>
      {
        group.pendingInvitations?.edges?.map(edges => {
          return (
            <UserInvitePendingList>
              <Text>{edges?.node?.email}</Text>
              <Text color="gray.500">{edges?.node?.isAdmin ?
                intl.formatMessage({id: 'global.admin'})
                : intl.formatMessage({id: 'roles.user'})}</Text>
            </UserInvitePendingList>
          )
        })
      }
      {hasNext && (
        <ListGroupItem style={{ textAlign: 'center' }}>
          {isLoadingNext ? (
            <Loader />
          ) : (
            <Button bsStyle="link" onClick={() => loadNext(50)}>
              <FormattedMessage id="global.more" />
            </Button>
          )}
        </ListGroupItem>
      )}
    </>
  );
};

export default GroupAdminPendingInvitationsList
