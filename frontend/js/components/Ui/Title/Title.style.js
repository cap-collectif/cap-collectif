// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import type { TitleProps } from './Title';

const TitleContainer: StyledComponent<{}, {}, (TitleProps) => React.Node> = styled(
  ({ type, children, ...props }) => React.createElement(type, props, children),
).attrs({
  className: 'title',
})``;

export default TitleContainer;
