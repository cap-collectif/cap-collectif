// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { usePickableList } from '~ui/List/PickableList';
import CancelUserInvitationsMutation from '~/mutations/CancelUserInvitationsMutation';

type Props = {|
  +onStartLoading?: () => void,
  +onStopLoading?: () => void,
|};

const Button: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  outline: none;
  border: none;
  background: transparent;
  font-family: inherit;
  margin-left: auto;
`;

export const UserInviteListHeader = ({ onStartLoading, onStopLoading }: Props) => {
  const { selectedRows, rowsCount } = usePickableList();
  const intl = useIntl();
  return (
    <React.Fragment>
      <FormattedMessage id="user-pending-invitations" values={{ count: rowsCount }} />
      {selectedRows.length > 0 && (
        <Button
          type="button"
          onClick={async () => {
            try {
              // wait til we update eslint so it supports this syntax
              // eslint-disable-next-line no-unused-expressions
              onStartLoading?.();
              await CancelUserInvitationsMutation.commit({
                input: {
                  invitationsIds: selectedRows,
                },
              });
              // eslint-disable-next-line no-unused-expressions
              onStopLoading?.();
            } catch (e) {
              // eslint-disable-next-line no-unused-expressions
              onStopLoading?.();
              console.error(e);
            }
          }}>
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
      )}
    </React.Fragment>
  );
};

export default UserInviteListHeader;
