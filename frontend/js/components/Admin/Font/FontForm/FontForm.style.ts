import styled from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile } from '~/utils/sizes'

const FontFormContainer = styled.form.attrs({
  className: 'form-font',
})`
  input {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  label {
    color: ${colors.primaryColor};
    border: 1px solid ${colors.primaryColor};
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    margin: 15px 0;
    transition: all 0.2s;
    font-weight: normal;

    &:hover {
      background-color: ${colors.primaryColor};
      color: #fff;

      svg {
        fill: #fff;
      }
    }

    svg {
      margin-right: 6px;
      fill: ${colors.primaryColor};
    }

    span {
      vertical-align: middle;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    padding: 0 20px 20px 20px;
  }
`
export default FontFormContainer
