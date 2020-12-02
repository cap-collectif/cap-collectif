// @flow
import * as React from 'react';

export const cleanChildren = (children?: React.Node) => {
  if (!children) return [];
  return (React.Children.toArray(children).filter(child => React.isValidElement(child)): any);
};
