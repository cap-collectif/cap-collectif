// @flow
import React from 'react';
import styled from 'styled-components';
import withColors from '../../Utils/withColors';

type Props = {
  children: any,
  backgroundColor: string,
  labelColor: string,
};

const H3 = styled.h3`
  margin-bottom: 15px;
  p {
    background-color: ${props => props.backgroundColor || '#546E7A'};
    color: ${props => props.labelColor || '#ffffff'};
    padding: 8px;
  }
`;

const TitleInvertContrast = ({ children, backgroundColor, labelColor }: Props) => (
  <H3 backgroundColor={backgroundColor} labelColor={labelColor}>
    <p>{children}</p>
  </H3>
);

export default withColors(TitleInvertContrast);
