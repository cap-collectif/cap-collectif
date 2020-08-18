// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Modal } from 'react-bootstrap';

export const ModalDeleteProposalContainer: StyledComponent<{}, {}, typeof Modal> = styled(Modal)`
  .hide-content {
    margin-bottom: 15px;
  }

  .modal-delete-proposal-dialog {
    margin: 60px auto;
  }

  textarea {
    resize: none;
  }
`;
