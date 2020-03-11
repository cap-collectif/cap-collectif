// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const FakeLoaderBarContainer: StyledComponent<
  { isLoading: boolean, isFinished: boolean, timeToEnd: number },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'fakeLoaderBar-container',
})`
  width: 100%;
  height: 10px;
  background-color: rgba(8, 138, 32, 0.2);
  border-radius: 10px;
  overflow: hidden;

  .progress {
    display: block;
    height: 100%;
    background-color: ${colors.successColor};
    animation: ${props => props.isLoading && 'animateWidthProgress 3s linear forwards'}
      ${props =>
        props.isFinished && `, animateEndWidthProgress ${props.timeToEnd}ms linear forwards`};
  }

  @keyframes animateWidthProgress {
    0% {
      width: 0;
    }
    100% {
      width: 95%;
    }
  }

  @keyframes animateEndWidthProgress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
`;

export default FakeLoaderBarContainer;
