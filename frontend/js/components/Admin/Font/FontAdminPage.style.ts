import styled from 'styled-components'
import classNames from 'classnames'
import { mediaQueryMobile } from '~/utils/sizes'
import colors from '~/utils/colors'

const classes = classNames({
  'font-admin-page box box-primary container-fluid': true,
})
const FontAdminPageContainer = styled.div.attrs({
  className: classes,
})`
  .box-header {
    margin: 30px 0 15px 0;
    padding: 0;

    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      margin-bottom: 15px;
    }

    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    a {
      margin-left: 20px;

      span {
        vertical-align: middle;
      }

      svg {
        margin-right: 6px;
      }
    }

    .info {
      color: ${colors.darkGray};
      margin: 0;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    padding: 0 0 20px 0 !important;

    .box-header {
      padding: 0 10px;

      > div {
        justify-content: space-between;
      }
    }
  }
`
export default FontAdminPageContainer
