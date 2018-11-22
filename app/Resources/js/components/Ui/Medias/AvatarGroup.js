// @flow
import * as React from 'react';
import styled, { css } from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  children?: Array<React.Node>,
  childrenSize: number,
};

const createCSS = (props: Props) => {
  const { childrenSize } = props;

  let styles = '';

  for (let i = 1; i < 6; i += 1) {
    styles += `
       & > *:nth-child(${i + 1}) {
         z-index: ${6 - i};
         left: ${(childrenSize / 2 + 10) * i}px;
       }
     `;
  }

  return css`
    ${styles}
  `;
};

export const Container = styled.div.attrs({
  className: 'avatar-group',
})`
  position: relative;

  & > *:first-child {
    position: relative;
    z-index: 7;
  }

  & > *:not(:first-child) {
    position: absolute;
  }

  img,
  svg {
    border: 1.5px solid ${colors.white};
  }

  ${props => createCSS(props)}
`;

export class AvatarGroup extends React.Component<Props> {
  static defaultProps = {
    childrenSize: 45,
  };

  render() {
    const { children, childrenSize } = this.props;

    return <Container childrenSize={childrenSize}>{children}</Container>;
  }
}

export default AvatarGroup;
