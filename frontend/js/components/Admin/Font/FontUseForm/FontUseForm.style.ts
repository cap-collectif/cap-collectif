import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile } from '~/utils/sizes'

const FontUseFormContainer: StyledComponent<any, {}, HTMLFormElement> = styled.form.attrs({
  className: 'font-admin-content',
})`
  table {
    width: 100%;
    font-weight: normal;
    border: 1px solid ${colors.borderColor};

    tr {
      border-bottom: 1px solid ${colors.borderColor};
    }

    td {
      vertical-align: middle;
      font-size: 16px;
      padding: 15px;
    }

    th:first-child,
    td:first-child {
      padding-left: 15px;
    }

    th:last-child,
    td:last-child {
      padding-right: 15px;
    }

    th {
      font-size: 16px;
      font-weight: 600;
      padding: 10px 0;
      text-transform: capitalize;

      &.small__column {
        width: 14%;
        text-align: center;
      }
    }

    tbody {
      tr:nth-child(odd) {
        background-color: #fafafa;
      }
    }

    input[type='radio'] {
      display: none;
    }

    label {
      line-height: 1;
      margin-bottom: 0;
      cursor: pointer;
    }

    .radio__cell {
      text-align: center;

      .radio label {
        margin-left: 0;
      }
    }
  }

  .btn-remove {
    display: block;
    font-family: 'OpenSans', Helvetica, Arial, sans-serif;
    color: ${colors.dangerColor};
    font-size: 16px;
    background: none;
    border: none;
    padding: 0;
    margin: 6px 0 0 0;

    span {
      vertical-align: middle;
    }

    svg,
    path {
      margin-right: 6px;
      fill: ${colors.dangerColor};
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    table {
      border-left: none;
      border-right: none;
    }
  }
`
export const FontNameContainer = styled.td<{
  fontName?: string
}>`
  & > span {
    font-family: ${props => props.fontName}, 'Helvetica', sans-serif;
    font-weight: 400;
  }

  .loader {
    display: inline-block;
    margin-right: 15px;
    padding: 0;
    width: 30px;
    vertical-align: middle;
  }
`
export default FontUseFormContainer
