// @ts-nocheck
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export type Colors = {
  name: string
}
export const Container: StyledComponent<
  {
    nameColor: string
  },
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'user-slide',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  max-height: 100px;
  font-size: 16px;
  max-width: 380px;

  & > div {
    display: flex;
    flex-direction: column;
  }

  .name,
  .job {
    margin: 0;
  }

  .name {
    color: ${props => props.nameColor};
    font-weight: bold;
    margin-bottom: 2px;
  }

  .job {
    color: #ababab;
    font-weight: 600;
    font-size: 12px;
  }

  .avatar-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 14px;
    background-color: #fff;
    overflow: hidden;

    img {
      width: auto;
      height: 100%;
    }
  }
`
