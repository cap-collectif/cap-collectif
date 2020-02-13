// @flow
import styled, { type StyledComponent } from 'styled-components';
import { boxShadow } from '~/utils/colors';

const UserRepliesContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'userReplies hidden-print',
})`
  .list-group {
    margin-top: 15px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: ${boxShadow};
  }
`;

export default UserRepliesContainer;
