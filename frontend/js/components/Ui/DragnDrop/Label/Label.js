// @flow
import * as React from 'react';
import LabelContainer from './Label.style';

type LabelProps = {
  children: React.Node,
};

const Label = ({ children }: LabelProps) => <LabelContainer>{children}</LabelContainer>;

export default Label;
