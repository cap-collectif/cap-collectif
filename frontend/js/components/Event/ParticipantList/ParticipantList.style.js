// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { MAX_WIDTH_PAGE } from '~/components/Event/EventPageHeader/EventPageHeader.style';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import { mediaQueryMobile } from '~/utils/sizes';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: center;
  background-color: ${colors.pageBgc};
  width: 100%;
  padding: 20px;

  & > div {
    display: flex;
    flex-direction: column;
    width: ${MAX_WIDTH_PAGE};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    & > div {
      width: 100%;
    }
  }
`;

export const TitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #000;
    text-transform: capitalize;
  }
`;

export const List: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0;
  margin: 0;

  .participant {
    margin-bottom: 15px;
    flex: 0 0 48%;
  }
`;

export const ButtonSeeAll: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  border: 1px solid ${colors.defaultCustomColor};
  background-color: transparent;
  align-self: flex-start;
  padding: 6px 12px;
  color: ${colors.defaultCustomColor};
  ${MAIN_BORDER_RADIUS};

  &:hover {
    background-color: ${colors.defaultCustomColor};
    color: #fff;
  }
`;
