// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

export const MAX_WIDTH_PAGE = '40%';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 35px;
  background-color: ${colors.pageBgc};
  width: 100%;

  & > div {
    width: ${MAX_WIDTH_PAGE};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    padding: 35px 14px;

    & > div {
      width: 100%;
    }
  }
`;

export const TitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  .icon {
    margin-right: 8px;
    margin-top: 4px;
  }

  h1 {
    margin: 0;
  }
`;

export const InfoContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  margin: 20px 0;

  .user-avatar {
    margin-right: 15px;
  }
`;

export const TagsList: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  color: ${colors.darkGray};

  .tag {
    padding: 0;
    margin-bottom: 8px;
    white-space: normal;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const ActionContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 30px;

  .external-link {
    margin-right: 10px;
  }
`;

export const UsernameContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .username {
    margin-right: 10px;
  }
`;

export const InfoLineContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${colors.borderColor};
  border-bottom: 1px solid ${colors.borderColor};
  padding: 5px 0;

  .number {
    font-weight: bold;
    margin-right: 5px;
  }

  & > div {
    margin-right: 15px;
  }
`;
