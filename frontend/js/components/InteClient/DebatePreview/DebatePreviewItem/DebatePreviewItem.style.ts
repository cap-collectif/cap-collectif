// @ts-nocheck

import styled from 'styled-components'
import { LIGHT_BOX_SHADOW, MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const Container = styled.a.attrs({
  className: 'debate-preview-item',
})`
  display: flex;
  flex-direction: column;
  padding: 18px;
  ${MAIN_BORDER_RADIUS};
  transition: all 0.3s;
  text-decoration: none;

  p {
    margin: 15px 0 0 0;
    color: #000;
    font-weight: bold;
  }

  &:hover {
    background-color: #fff;
    ${LIGHT_BOX_SHADOW};

    .image-container {
      button,
      .overlay {
        display: block;
      }

      .overlay {
        opacity: 1;
      }
    }
  }
`
export const ImageContainer: StyledComponent<
  {
    img: string
  },
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'image-container',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 250px;
  position: relative;
  z-index: 1;
  ${MAIN_BORDER_RADIUS};
  background-size: cover;
  background-image: ${props => `url(${props.img})`};
  background-repeat: no-repeat;
  background-position: center;
  overflow: hidden;

  .overlay {
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: all 0.3s;
    opacity: 0;
  }

  button {
    display: none;
    border: 1px solid #fff;
    background-color: transparent;
    color: #fff;
    padding: 14px 28px;
    ${MAIN_BORDER_RADIUS};
    text-transform: uppercase;
    font-weight: 600;
    font-size: 18px;

    &:hover {
      background-color: #fff;
      color: #000;
    }
  }
`
