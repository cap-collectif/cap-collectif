// @flow
import styled, { type StyledComponent } from 'styled-components';

const GroupListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default GroupListContainer;
