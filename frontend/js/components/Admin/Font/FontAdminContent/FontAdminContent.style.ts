import styled from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes'

const FontAdminContentContainer = styled.div.attrs({
  className: 'font-admin-content',
})`
  width: 50%;

  .error {
    display: flex;
    color: ${colors.error};
    align-items: flex-start;
    margin-top: 10px;

    a {
      color: inherit;
      text-decoration: underline;
    }

    svg,
    path {
      width: 15px;
      height: 15px;
      min-width: 15px;
      margin-right: 8px;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;

    .error {
      padding: 0 20px;
    }
  }

  @media (max-width: ${mediaQueryTablet.minWidth}) {
    width: 100%;
  }
`
export default FontAdminContentContainer
