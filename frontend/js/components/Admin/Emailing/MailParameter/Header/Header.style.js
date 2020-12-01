// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import { LIGHT_BOX_SHADOW, MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors from '~/utils/colors';

const commonCssInput = css`
  height: 34px;
  font-size: 18px;
  font-weight: 600;
  padding: 5px;
  margin: 0;
  background-color: transparent;
`;

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

  .input-title {
    position: relative;

    &:hover {
      background-color: #f7f7f8;
      ${MAIN_BORDER_RADIUS};

      input {
        color: #f7f7f8;
      }
    }
  }

  .wrapper-title {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    z-index: 1;
    white-space: pre;
    color: #000;
    ${commonCssInput};

    &.not-editable {
      position: static;
      background-color: transparent;
    }

    span {
      display: inline;
    }
  }

  .form-group {
    margin: 0;

    input {
      color: #fff;
      min-width: 1px;
      border: none;
      box-shadow: none;
      outline: none;
      ${commonCssInput};

      &:focus {
        color: #000;
        background-color: #f7f7f8;
        box-shadow: 0 0 3px 1px #bec4c8;
        border: 1px solid ${colors.lightGray};
      }
    }
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
  background-color: ${colors.blue};
  color: #fff;
  border: none;
  margin-left: 10px;
  ${MAIN_BORDER_RADIUS};
`;

export const ButtonCancelPlanned: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  padding: 8px;
  background: none;
  color: #000;
  border: 1px solid ${colors.borderColor};
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
      color: ${colors.blue};

      &:focus,
      &:hover {
        text-decoration: none;
      }

      &.selected {
        border-bottom: 2px solid ${colors.blue};
      }
    }
  }
`;
