import styled from 'styled-components'
import colors from '~/utils/colors'

const FontPopoverContainer = styled.div.attrs({
  className: 'font-popover-content',
})`
  .body {
    padding: 14px 0;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .title {
      font-weight: 600;
      width: 80%;
    }

    .btn-close {
      background: none;
      border: none;
    }

    .description {
      margin: 15px 0 0 0;
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 9px;
    border-top: 1px solid ${colors.lightGray};

    .btn-cancel {
      border: 1px solid ${colors.darkGray};
      color: ${colors.darkGray};
    }

    .btn-confirm {
      background-color: ${colors.dangerColor};
      border: 1px solid ${colors.dangerColor};
      color: #fff;
      margin-left: 8px;
    }
  }
`
export default FontPopoverContainer
