// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Modal } from 'react-bootstrap';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const Container: StyledComponent<{}, {}, typeof Modal> = styled(Modal)`
  .modal-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    &:before,
    &:after {
      content: none;
    }
  }
`;

export const InfoContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .icon {
    margin-right: 4px;
  }

  p {
    margin: 0;
  }

  .count-members {
    margin-right: 5px;
  }

  .project-title {
    margin-left: 5px;
  }
`;

export const ButtonSave: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  border: none;
  background-color: ${colors.darkGray};
  color: #fff;
  padding: 6px 12px;
  ${MAIN_BORDER_RADIUS};

  &:disabled {
    opacity: 0.5;
  }
`;
