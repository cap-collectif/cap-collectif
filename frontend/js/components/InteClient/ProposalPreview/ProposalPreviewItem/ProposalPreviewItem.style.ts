// @ts-nocheck
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export type Colors = {
  button: string
  name: string
}
export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
  className: 'proposal-preview-item',
})`
  display: flex;
  flex-direction: column;
  border: 1px solid #e8ebed;
  background-color: #fff;
  color: #000;
  padding: 20px;
  transition: all 0.3s;
  ${MAIN_BORDER_RADIUS};

  .proposal-content {
    margin: 20px 0;
  }

  &:hover,
  &:focus {
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  }
`
export const Header: StyledComponent<
  {
    btnColor: string
  },
  {},
  HTMLDivElement
> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  .avatar-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 55px;
    height: 55px;
    border-radius: 26.5px;
    margin-right: 14px;
    background-color: #fff;
    overflow: hidden;

    img {
      width: auto;
      height: 100%;
    }
  }

  a {
    background-color: ${props => props.btnColor};
    color: #fff;
    padding: 8px 14px;
    text-transform: uppercase;
    font-size: 12px;
    ${MAIN_BORDER_RADIUS};
  }
`
export const Footer: StyledComponent<
  {
    authorColor: string
  },
  {},
  HTMLDivElement
> = styled.div`
  display: flex;
  flex-direction: column;

  .author,
  .job {
    margin: 0;
  }

  .author {
    margin-bottom: 4px;
    color: ${props => props.authorColor};
    font-weight: bold;
  }

  .job {
    color: #ababab;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 2px;
  }
`
export default Container
