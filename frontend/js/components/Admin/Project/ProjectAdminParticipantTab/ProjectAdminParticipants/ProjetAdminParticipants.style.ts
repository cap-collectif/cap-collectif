import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/styles/modules/colors'

export const HeaderContainer: StyledComponent<any, {}, HTMLElement> = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem 0;
`
export const ButtonSendMail: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  color: ${colors.gray[800]};
  font-weight: bold;

  .icon {
    margin-right: 4px;
  }

  &:disabled {
    color: ${colors.gray[300]};
  }
`
