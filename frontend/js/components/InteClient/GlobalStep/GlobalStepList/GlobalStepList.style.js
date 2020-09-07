// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .global-step-item {
    width: 30%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .global-step-item {
      width: 100%;
    }
  }
`;
