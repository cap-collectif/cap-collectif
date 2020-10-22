// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Container, ButtonMembers } from './MailingListItem.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { type MailingListItem_mailingList } from '~relay/MailingListItem_mailingList.graphql';
import type { ModalMembersData } from '~/components/Admin/Emailing/ModalMembers/ModalMembers';

type Props = {|
  mailingList: MailingListItem_mailingList,
  selected: boolean,
  rowId: string,
  setMailingListModal: ModalMembersData => void,
|};

export const MailingListItem = ({ mailingList, selected, setMailingListModal }: Props) => {
  const { id, name, project, users } = mailingList;

  return (
    <Container rowId={id} selected={selected}>
      <h3>{name}</h3>

      {project && <p className="project-title">{project.title}</p>}

      <ButtonMembers
        type="button"
        onClick={() => setMailingListModal({ mailingListName: name, mailingListMembers: users })}>
        <Icon name={ICON_NAME.newUser} size={13} color="#6C757D" />
        <p>
          {users.totalCount}{' '}
          <FormattedMessage id="global.members" values={{ num: users.totalCount }} />
        </p>
      </ButtonMembers>
    </Container>
  );
};

export default createFragmentContainer(MailingListItem, {
  mailingList: graphql`
    fragment MailingListItem_mailingList on MailingList {
      id
      name
      users {
        totalCount
        edges {
          node {
            id
            email
          }
        }
      }
      project {
        title
      }
    }
  `,
});
