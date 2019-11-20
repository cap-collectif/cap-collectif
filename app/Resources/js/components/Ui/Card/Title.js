// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';

type Props = {
  tagName?: string,
  children: React.Node,
};

const e = React.createElement;

type ContainerProps = {
  tagName: string,
  children: React.Node,
};

const Container: StyledComponent<{}, {}, (ContainerProps) => React.Node> = styled(
  ({ tagName, children, ...props }) => e(tagName, props, children),
).attrs({
  className: 'card__title',
})`
  font-size: 18px;
  line-height: 1.2;
  margin: 0;
`;

export const Title = (props: Props) => {
  const { tagName, children } = props;

  if (tagName) {
    return <Container tagName={tagName}>{children}</Container>;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

Title.defaultProps = {
  tagName: 'h3',
};

export default Title;
