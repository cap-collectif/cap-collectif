// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';

export const UserInviteAdminPageContainer: StyledComponent<
  {},
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'user-invite-admin-page box box-primary container-fluid',
})`
  .box-header {
    margin: 30px 0 15px 0;
    padding: 0;

    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }
`;

export const UserInviteList: StyledComponent<{}, {}, typeof PickableList> = styled(PickableList)`
  p {
    margin-bottom: 0;
  }
`;
