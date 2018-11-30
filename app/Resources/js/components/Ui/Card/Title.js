// @flow
import * as React from 'react';
import styled from 'styled-components';

type Props = {
  tagName?: string,
  children?: React.Node,
};

const e = React.createElement;

const Container = styled(({ tagName, children, ...props }) => e(tagName, props, children))`
  font-size: 18px;
  line-height: 1.2;
  margin: 0 0 10px;
`;

export class Title extends React.PureComponent<Props> {
  static defaultProps = {
    tagName: 'h3',
  };

  render() {
    const { tagName, children } = this.props;

    if (tagName) {
      return <Container tagName={tagName}>{children}</Container>;
    }

    return <React.Fragment>{children}</React.Fragment>;
  }
}

export default Title;
