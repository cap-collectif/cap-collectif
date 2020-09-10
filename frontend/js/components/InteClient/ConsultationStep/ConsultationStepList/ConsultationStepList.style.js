// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  max-height: 400px;

  .consultation-step-item {
    width: 48%;
    margin-bottom: 50px;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .consultation-step-item {
      width: 100%;
    }
  }
`;
