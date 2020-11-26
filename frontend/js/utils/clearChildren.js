// @flow
import * as React from 'react';

export const cleanChildren = (children: React.Node) => {
  return (React.Children.toArray(children).filter(child => React.isValidElement(child)): any);
};
