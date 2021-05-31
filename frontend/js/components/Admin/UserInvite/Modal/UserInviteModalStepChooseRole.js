// @flow

import * as React from 'react';
import { useState } from 'react';
import { InputGroup } from 'react-bootstrap';
import { FormattedMessage, useIntl } from 'react-intl';
import Select from 'react-select';
import { useFragment, graphql } from 'react-relay';
import { useUserInviteModalContext } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import Radio from '~ui/Form/Input/Radio/Radio';
import type { UserInviteModalStepChooseRole_query$key } from '~relay/UserInviteModalStepChooseRole_query.graphql';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import { ModalBody } from '../UserInviteAdminPage.style';

type Props = {|
  +queryFragment: UserInviteModalStepChooseRole_query$key,
|};

const FRAGMENT = graphql`
  fragment UserInviteModalStepChooseRole_query on Query {
    groupsData: groups {
      id
      title
    }
  }
`;

export const UserInviteModalStepChooseRole = ({ queryFragment }: Props): React.Node => {
  const { dispatch, emails } = useUserInviteModalContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [groups, setGroups] = useState([]);
  const [options, setOptions] = useState([]);
  const intl = useIntl();

  const { groupsData } = useFragment(FRAGMENT, queryFragment);

  React.useEffect(() => {
    if (!groupsData) return;
    const optionsData = groupsData.map(({ id, title }) => {
      return { value: id, label: title };
    });
    setOptions(optionsData);
  }, [groupsData, setOptions]);

  const onGroupChange = items => {
    setGroups(
      items.map(({ value, label }) => {
        return {
          id: value,
          label,
        };
      }),
    );
  };

  return (
    <>
      <Modal.Header pb={6}>
        <Heading>{intl.formatMessage({ id: 'invitations.options' })}</Heading>
      </Modal.Header>
      <ModalBody>
        <AppBox mb={4}>
          <FormattedMessage id="global.role" tagName="p" />
          <InputGroup>
            <Radio
              label={intl.formatMessage({ id: 'roles.user' })}
              id="user"
              value="user"
              name="role"
              checked={!isAdmin}
              onChange={() => {
                setIsAdmin(false);
              }}
            />
          </InputGroup>
          <InputGroup>
            <Radio
              label={intl.formatMessage({ id: 'roles.admin' })}
              id="admin"
              value="admin"
              name="role"
              checked={isAdmin}
              onChange={() => {
                setIsAdmin(true);
              }}
            />
          </InputGroup>
        </AppBox>
        <InputGroup>
          <Flex mb={2}>
            <Text color="gray.900" mr={2}>
              {intl.formatMessage({ id: 'admin.label.group' })}
            </Text>
            <Text color="gray.400">{intl.formatMessage({ id: 'global.optional' })}</Text>
          </Flex>
          <AppBox maxWidth="552px">
            <Select options={options} isMulti onChange={onGroupChange} />
          </AppBox>
        </InputGroup>
      </ModalBody>
      <Modal.Footer as="div" pt={6}>
        <ButtonGroup>
          <Button
            variant="tertiary"
            variantSize="big"
            variantColor="hierarchy"
            onClick={() => {
              dispatch({ type: 'GOTO_CHOOSE_USERS_STEP' });
            }}>
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
          <Button
            variant="primary"
            variantSize="big"
            onClick={() =>
              dispatch({ type: 'GOTO_SENDING_CONFIRMATION', payload: { emails, isAdmin, groups } })
            }>
            {intl.formatMessage({ id: 'global.next' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  );
};

export default UserInviteModalStepChooseRole;
