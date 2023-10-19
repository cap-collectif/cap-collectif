import { keyframes } from 'styled-components'

export const blink = keyframes`
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  } 
`
export const slideInUp = keyframes`
  from {
    transform: translateY(-10%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`
export const slideInDown = keyframes`
  from {
    transform: translateY(10%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`
export const slideInRightToLeft = keyframes`
  from {
    transform: translateX(-10%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`
export const slideInLeftToRight = keyframes`
  from {
    transform: translateX(10%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`
export const fade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`
export const scaleUp = keyframes`
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`
export const disappearFromUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`
