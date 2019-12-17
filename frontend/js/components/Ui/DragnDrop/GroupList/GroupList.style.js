// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';

const GroupListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

  @media (max-width: ${mediaQueryMobile}) {
    flex-direction: column;
  }
`;

export default GroupListContainer;
