// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Modal } from 'react-bootstrap';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

const ModalLeavePageContainer: StyledComponent<{}, {}, Modal> = styled(Modal)`
  .btn-danger {
    background-color: transparent;
    color: ${colors.dangerColor};

    &:hover {
      color: #fff;
    }
  }

  @media (max-width: ${mediaQueryMobile}) {
    .modal-footer {
      display: flex;
      flex-direction: column;
    }

    .btn {
      margin: 0 0 10px 0;
    }
  }
`;

export default ModalLeavePageContainer;
