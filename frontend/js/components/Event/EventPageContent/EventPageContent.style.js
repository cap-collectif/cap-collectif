// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MAX_WIDTH_PAGE } from '~/components/Event/EventPageHeader/EventPageHeader.style';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import { mediaQueryMobile } from '~/utils/sizes';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  width: 100%;

  .share-button-dropdown {
    margin: 40px 0;
    align-self: flex-start;
  }

  .comments__section {
    width: ${MAX_WIDTH_PAGE};
  }

  .thumbnail-container {
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px solid ${colors.borderColor};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    padding: 15px;

    .comments__section {
      width: 100%;
    }

    .share-button-dropdown {
      margin: 20px 0;
    }
  }
`;

export const Content: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: ${MAX_WIDTH_PAGE};

  .description {
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px solid ${colors.borderColor};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
  }
`;

export const ButtonSubscribe: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background-color: ${colors.successColor};
  color: #fff;
  border: none;
  width: 100%;
  padding: 10px;
  ${MAIN_BORDER_RADIUS};
`;

export const ButtonUnsubscribe: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background-color: ${colors.dangerColor};
  color: #fff;
  border: none;
  width: 100%;
  padding: 10px;
  ${MAIN_BORDER_RADIUS};
`;
