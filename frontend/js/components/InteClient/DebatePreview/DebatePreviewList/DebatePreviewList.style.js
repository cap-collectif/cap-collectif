// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;

  .debate-preview-item {
    width: 32%;
    margin-bottom: 50px;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .debate-preview-item {
      width: 100%;
    }
  }
`;
