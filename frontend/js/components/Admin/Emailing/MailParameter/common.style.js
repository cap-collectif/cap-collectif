// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Modal } from 'react-bootstrap';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors from '~/utils/colors';

export const Container: StyledComponent<{ disabled: boolean }, {}, HTMLDivElement> = styled.div`
  background: #fff;
  border: 1px solid ${colors.borderColor};
  ${MAIN_BORDER_RADIUS};
  padding: 15px 20px;
  margin: 15px;

  h3 {
    font-weight: 600;
    color: #000;
    padding-bottom: 6px;
    border-bottom: 1px solid ${colors.borderColor};
    margin: 0 0 15px 0;
  }

  .editor {
    .ql-editor {
      min-height: 450px;
    }

    .ql-tooltip.ql-editing {
      z-index: 810;
    }
  }

  .error-block a {
    color: ${colors.dangerColor};
    pointer-events: none;
  }

  .rdtPicker {
    width: 340px;

    td,
    th {
      height: 50px;
    }

    .rdtNext,
    .rdtPrev {
      vertical-align: middle;
    }
  }

  iframe {
    border: none;
    width: 100%;
  }

  ${props =>
    props.disabled &&
    `
    button:disabled {
      opacity: 0.5;
    }
    
    .form-group {
      .editor,
      input,
      .btn-group,
      .rdt, 
      .input-group-addon,
      select {
        opacity: 0.5;
      }
  }`};
`;

export const ModalContainer: StyledComponent<{}, {}, typeof Modal> = styled(Modal)`
  .modal-dialog {
    width: 40%;
  }

  .modal-title {
    font-weight: 600;
  }
`;
