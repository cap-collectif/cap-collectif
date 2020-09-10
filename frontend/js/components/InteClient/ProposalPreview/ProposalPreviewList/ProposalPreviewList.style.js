// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  font-size: 16px;

  .proposal-preview-item {
    width: 32%;
    margin-bottom: 35px;
  }

  &:after {
    content: '';
    width: 32%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .proposal-preview-item {
      width: 100%;
    }
  }
`;
