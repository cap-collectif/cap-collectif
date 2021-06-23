// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Container, ButtonMembers } from './MailingListItem.style';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import { type MailingListItem_mailingList } from '~relay/MailingListItem_mailingList.graphql';
import Text from '~ui/Primitives/Text';
import Tooltip from '~ds/Tooltip/Tooltip';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  mailingList: MailingListItem_mailingList,
  selected: boolean,
  rowId: string,
  setMailingListSelected: string => void,
|};

export const MailingListItem = ({ mailingList, selected, setMailingListSelected }: Props) => {
  const { id, name, project, usersConsenting } = mailingList;
  const intl = useIntl();

  return (
    <Container rowId={id} selected={selected}>
      <ButtonMembers type="button" onClick={() => setMailingListSelected(id)}>
        {name}
      </ButtonMembers>

      {project && <p className="project-title">{project.title}</p>}

      <Flex direction="row" align="center">
        <Flex>
          <Icon name={ICON_NAME.USER_O} size="md" color="gray.500" mr={1} />
          <Text as="span" mr={1}>
            {usersConsenting.totalCount}
          </Text>
          <Text>
            <FormattedMessage id="global.members" values={{ num: usersConsenting.totalCount }} />
          </Text>
        </Flex>
        <Tooltip
          label={intl.formatMessage(
            { id: 'has-consent-to-internal-email' },
            { num: usersConsenting.totalCount },
          )}>
          <Flex ml={1}>
            <Icon name={ICON_NAME.CIRCLE_INFO} size="md" color="blue.500" />
          </Flex>
        </Tooltip>
      </Flex>
    </Container>
  );
};

export default createFragmentContainer(MailingListItem, {
  mailingList: graphql`
    fragment MailingListItem_mailingList on MailingList {
      id
      name
      usersConsenting: users(consentInternalCommunicationOnly: true) {
        totalCount
      }
      project {
        title
      }
    }
  `,
});
