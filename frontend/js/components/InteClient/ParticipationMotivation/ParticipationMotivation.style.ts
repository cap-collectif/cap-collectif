// @ts-nocheck

import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  .motivation-container {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`
export const MotivationContainer: StyledComponent<
  {
    color: string
  },
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'motivation-container',
})`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  font-size: 18px;

  .icon {
    margin-right: 5px;
  }

  p {
    margin: 0;

    span {
      font-weight: bold;
      color: ${props => props.color};
    }
  }
`
