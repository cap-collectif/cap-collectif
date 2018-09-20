// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import styled from 'styled-components';
import type { GlobalState } from '../../types';

type Props = {
  children: any,
  parameters: any,
};

const H3 = styled.h3`
  margin-bottom: 15px;
  span {
    background-color: ${props => props.primaryBg || '#546E7A'};
    color: ${props => props.primaryText || '#ffffff'};
    padding: 8px;
  }
`;

const TitleInvertContrast = ({ children, parameters }: Props) => (
  <H3
    primaryBg={parameters['color.btn.primary.bg']}
    primaryText={parameters['color.btn.primary.text']}>
    <span>{children}</span>
  </H3>
);

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  parameters: state.default.parameters,
});

export default connect(mapStateToProps)(TitleInvertContrast);
