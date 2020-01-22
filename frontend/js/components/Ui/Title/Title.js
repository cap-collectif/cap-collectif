// @flow
import * as React from 'react';
import TitleContainer from './Title.style';

export const TYPE: {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
} = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
};

export type TitleProps = {
  type: $Values<typeof TYPE>,
  children: any,
  className?: string,
};

const Title = ({ type, className, children }: TitleProps) => (
  <TitleContainer type={type} className={className}>
    {children}
  </TitleContainer>
);

export default Title;
