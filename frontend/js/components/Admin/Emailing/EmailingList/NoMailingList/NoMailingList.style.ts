import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'

export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 50px 0;
  color: ${colors.darkGray};
  font-size: 16px;

  a {
    margin-top: 20px;
    text-transform: uppercase;
    font-weight: 600;
  }

  p {
    margin: 0;
    width: 50%;
    text-align: center;

    &:first-of-type {
      font-weight: bold;
      margin: 12px 0;
    }
  }
`
