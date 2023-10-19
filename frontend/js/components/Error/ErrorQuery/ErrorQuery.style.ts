import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const ButtonRetry: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 5px 8px;
  border: 1px solid ${colors.borderColor};
  ${MAIN_BORDER_RADIUS};
  margin-top: 10px;

  .icon {
    margin-right: 5px;
  }
`
