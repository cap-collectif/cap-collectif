import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import Modal from '~ds/Modal/Modal'

export const ModalDeleteProposalContainer: StyledComponent<any, {}, typeof Modal> = styled(Modal)`
  .hide-content {
    margin-bottom: 15px;
  }

  .modal-delete-proposal-dialog {
    margin: 60px auto;
  }

  textarea {
    resize: none;
  }
`
