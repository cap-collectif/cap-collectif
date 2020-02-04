// @flow
import styled, { type StyledComponent } from 'styled-components';

const EngagementListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 16px;
`;

export default EngagementListContainer;
