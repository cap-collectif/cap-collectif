import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import colors from '~/utils/colors'

export const InstructionContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  text-align: center;
  background-color: ${colors.pageBgc};
  ${MAIN_BORDER_RADIUS};

  p {
    width: 70%;
    line-height: 1.5;
  }
`
export const ButtonMembers: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  padding: 8px;
  background-color: ${colors.blue};
  color: #fff;
  border: none;
  ${MAIN_BORDER_RADIUS};
  margin-bottom: 15px;
`
