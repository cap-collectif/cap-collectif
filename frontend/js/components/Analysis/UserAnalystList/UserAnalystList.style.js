// @flow
import styled, { type StyledComponent } from 'styled-components';

export const SPACE_BETWEEN_AVATAR = 8;

const UserAnalystListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;

  .user-analyst-list-hidden {
    margin-left: ${SPACE_BETWEEN_AVATAR}px;
  }
`;

export default UserAnalystListContainer;
