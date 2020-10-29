// @flow
import styled, { type StyledComponent } from 'styled-components';
import { LIGHT_BOX_SHADOW, MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const Container: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: column;
  padding: 15px 15px 0 15px;
  background-color: #fff;
`;

export const TitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 15px 0;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    word-break: break-word;
    margin: 0;
  }
`;

export const Title: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .form-group {
    margin: 0;
  }
`;

export const LabelPlannedContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .label-state {
    margin-right: 10px;
  }
`;

export const ButtonEditTitle: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  margin: 0 0 0 5px;
  padding: 0;
  background: none;
  border: none;
`;

export const ButtonSendContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const ErrorContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  width: 300px;
  padding: 12px;
  background-color: #fff;
  ${LIGHT_BOX_SHADOW};
  ${MAIN_BORDER_RADIUS};

  .icon {
    margin-right: 5px;
  }
`;

export const ButtonSendMail: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  padding: 8px;
  background-color: #3b88fd;
  color: #fff;
  border: none;
  margin-left: 10px;
  ${MAIN_BORDER_RADIUS};
`;

export const ButtonCancelPlanned: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  padding: 8px;
  background: none;
  color: #000;
  border: 1px solid #ddd;
  ${MAIN_BORDER_RADIUS};
`;

export const NavContainer: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  width: 100%;
  list-style: none;
  display: flex;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    margin-right: 20px;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;

    a {
      padding-bottom: 10px;

      &:focus,
      &:hover {
        text-decoration: none;
      }

      &.selected {
        border-bottom: 2px solid #0388cc;
      }
    }
  }
`;
