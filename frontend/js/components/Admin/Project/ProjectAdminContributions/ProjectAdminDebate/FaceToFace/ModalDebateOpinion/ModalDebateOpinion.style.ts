import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { Modal } from 'react-bootstrap'

export const ModalContainer: StyledComponent<any, {}, typeof Modal> = styled(Modal)`
  .modal-header {
    border: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 24px;
  }

  .modal-header,
  .modal-footer {
    border: none;
  }

  .modal-body,
  .modal-footer {
    padding-top: 8px;
  }

  form {
    .form-group:last-child {
      margin-bottom: 0;
    }
  }
`
