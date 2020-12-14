// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Modal } from 'react-bootstrap';

export const Container: StyledComponent<{}, {}, typeof Modal> = styled(Modal)`
  .modal-header {
    border: none;
  }

  .modal-footer {
    border: none;
  }
`;
