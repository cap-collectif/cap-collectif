// @ts-nocheck
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import Slider from 'react-slick'

export const Container: StyledComponent<any, {}, HTMLDivElement> = styled(Slider)`
  .slick-track {
    display: flex;
  }
`
