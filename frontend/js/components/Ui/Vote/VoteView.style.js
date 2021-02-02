// @flow
import styled, { type StyledComponent, css, keyframes } from 'styled-components';
import { fade } from '~/utils/styles/keyframes';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import { styleGuideColors } from '~/utils/colors';

const progressBar = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
`;

/* stylelint-disable */
const progressCircle = (direction: string) => keyframes`
  0% {
    margin-${direction}: 0; 
  }
  100% {
    margin-${direction}: calc(100% - 65px);
  }
`;

const bubble = (direction: string, startPercentage: number) => keyframes`
  0% {
    margin-${direction}: 0;
  }

  ${startPercentage - 20}% {
    margin-${direction}: ${startPercentage}%;
    transform: translateY(0) translateX(0);

  }

  ${startPercentage}% {
    margin-${direction}: ${startPercentage}%;
    transform: translateY(-20px) translateX(${direction === 'left' ? '-80px' : '80px'});
    opacity: .8;
  }

  ${startPercentage + 5}% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
`;
/* stylelint-enable */

export const Container: StyledComponent<
  { left: number, right: number },
  {},
  HTMLDivElement,
> = styled.div`
  width: 60%;
  margin-bottom: 16px;
  ${({ left, right }) => css`
    > div:first-child {
      display: flex;
      margin-bottom: 5px;
      > div:first-child {
        position: relative;
        width: ${left}%;
      }
      > div:last-child {
        position: relative;
        width: ${right}%;
      }

      .circle {
        padding: 6px 8px;
        background-color: ${styleGuideColors.green500};
        width: 46px;
        height: 44px;
        border-radius: 50px;
        position: relative;
        ${left > 10 &&
          css`
            animation: ${progressCircle('left')} 0.5s ease-in-out;
            animation-fill-mode: both;
          `}

        :after {
          content: '';
          position: absolute;
          left: 8px;
          top: 38px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 14px solid ${styleGuideColors.green500};
        }
      }

      .circle.red {
        ${right > 10 &&
          css`
            animation: ${progressCircle('right')} 0.5s ease-in-out;
            animation-fill-mode: both;
          `}

        background-color: ${styleGuideColors.red500};
        float: right;
        :after {
          border-top: 14px solid ${styleGuideColors.red500};
        }
        > svg {
          transform: rotate(180deg);
        }
      }

      .bubble {
        padding: 0 1px;
        position: absolute;
        width: 33px;
        height: 33px;
        top: 10px;
        left: 10px;
        opacity: 0.8;
        background-color: ${styleGuideColors.green500};
        border-radius: 50px;
        ${left > 10 &&
          css`
            :not(.reverse) {
              animation: ${bubble('left', 20)} 0.75s ease-in-out;
              animation-fill-mode: both;

              :nth-child(2) {
                animation: ${bubble('left', 30)} 0.75s ease-in-out;
                animation-fill-mode: both;
              }
              :nth-child(3) {
                animation: ${bubble('left', 40)} 0.75s ease-in-out;
                animation-fill-mode: both;
              }
              :nth-child(4) {
                animation: ${bubble('left', 50)} 0.75s ease-in-out;
                animation-fill-mode: both;
              }
              :nth-child(5) {
                animation: ${bubble('left', 60)} 0.75s ease-in-out;
                animation-fill-mode: both;
              }
            }
          `}
      }

      .bubble.reverse {
        right: 10px;
        left: unset;
        background-color: ${styleGuideColors.red500};
        ${right > 10 &&
          css`
            animation: ${bubble('right', 20)} 0.75s ease-in-out;
            animation-fill-mode: both;

            :nth-child(2) {
              animation: ${bubble('right', 30)} 0.75s ease-in-out;
              animation-fill-mode: both;
            }
            :nth-child(3) {
              animation: ${bubble('right', 40)} 0.75s ease-in-out;
              animation-fill-mode: both;
            }
            :nth-child(4) {
              animation: ${bubble('right', 50)} 0.75s ease-in-out;
              animation-fill-mode: both;
            }
            :nth-child(5) {
              animation: ${bubble('right', 60)} 0.75s ease-in-out;
              animation-fill-mode: both;
            }
          `}
      }
    }

    > div:nth-child(2) {
      height: 8px;
      position: relative;
      overflow: hidden;
      ${MAIN_BORDER_RADIUS};
      display: flex;

      span {
        display: block;
        height: 100%;
      }
      > span:first-child {
        width: ${left}%;
      }

      > span:last-child {
        width: ${right}%;
      }

      .progressBar {
        border-radius: 4px;
        background-color: ${styleGuideColors.green500};
        animation: ${progressBar} 0.5s ease-in-out;
        animation-fill-mode: both;
      }

      .progressBar.red {
        background-color: ${styleGuideColors.red500};
        float: right;
      }
    }

    > div:last-child {
      opacity: 0;
      animation: ${fade} 0.1s forwards;
      animation-delay: 0.5s;
      display: flex;
      margin-top: 10px;
      font-size: 18px;
      font-weight: 600;
      line-height: 24px;
      color: #2b2b2b;

      > span:first-child {
        text-align: right;
        margin-right: 22px;
        margin-left: -12px;
        width: ${left}%;
      }

      > span::last-child {
        margin-left: 5px;
        width: calc(${right}% - 10px);
      }
    }
  `}
`;
