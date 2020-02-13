// @flow
import * as React from 'react';
import LabelContainer from './Label.style';

type LabelProps = {
  children: React.Node | string,
};

const Label = ({ children }: LabelProps) => (
  <LabelContainer>
    {typeof children === 'string' ? (
      <span dangerouslySetInnerHTML={{ __html: children }} />
    ) : (
      children
    )}
  </LabelContainer>
);

export default Label;
