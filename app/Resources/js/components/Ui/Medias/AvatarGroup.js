// @flow
import * as React from 'react';
import styled, { css } from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  children?: Array<React.Element<any>>,
  childrenSize: number,
};

const createCSS = (props: Props) => {
  const { childrenSize, children } = props;

  let styles = '';

  if (children) {
    for (let i = 1; i < children.length; i += 1) {
      styles += `
       & > *:nth-child(${i + 1}) {
         z-index: ${children.length - i};
         left: ${(childrenSize / 2 + 10) * i}px;
       }
     `;
    }
  }

  return css`
    ${styles}
  `;
};

export const Container = styled.div.attrs({
  className: 'avatar-group',
})`
  position: relative;
  overflow: hidden;

  & > *:first-child {
    position: relative;
    z-index: ${props => props.length};
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

    return (
      <Container childrenSize={childrenSize} length={children && children.length}>
        {children}
      </Container>
    );
  }
}

export default AvatarGroup;
