// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Container, ButtonMembers, InfoMembers } from './MailingListItem.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { type MailingListItem_mailingList } from '~relay/MailingListItem_mailingList.graphql';
import colors from '~/utils/colors';

type Props = {|
  mailingList: MailingListItem_mailingList,
  selected: boolean,
  rowId: string,
  setMailingListSelected: string => void,
|};

export const MailingListItem = ({ mailingList, selected, setMailingListSelected }: Props) => {
  const { id, name, project, users } = mailingList;

  return (
    <Container rowId={id} selected={selected}>
      <ButtonMembers type="button" onClick={() => setMailingListSelected(id)}>
        {name}
      </ButtonMembers>

      {project && <p className="project-title">{project.title}</p>}

      <InfoMembers>
        <Icon name={ICON_NAME.newUser} size={13} color={colors.secondaryGray} />
        <p>
          {users.totalCount}{' '}
          <FormattedMessage id="global.members" values={{ num: users.totalCount }} />
        </p>
      </InfoMembers>
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
      }
      project {
        title
      }
    }
  `,
});
