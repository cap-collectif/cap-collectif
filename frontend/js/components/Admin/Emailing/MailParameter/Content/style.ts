import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import colors from '~/utils/colors'

export const PreviewContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  font-weight: 600;
  margin-bottom: 15px;

  p {
    margin-bottom: 10px;
  }

  button {
    background-color: #fff;
    color: #000;
    border: 1px solid ${colors.borderColor};
    padding: 8px;
    ${MAIN_BORDER_RADIUS};

    &:first-of-type {
      margin-right: 8px;
    }

    span {
      vertical-align: middle;
    }

    .icon {
      margin-right: 5px;
    }
  }
`
