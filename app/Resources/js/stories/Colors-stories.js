// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #e3e3e3;

  &:first-child {
    padding-top: 0;
  }
`;

const ColorContainer = styled.div`
  height: 40px;
  width: 40px;
  margin-right: 15px;
  border: 1px solid #acacac;
  border-radius: 4px;
  background-color: ${props => props.hex};
`;

const colors = [
  { hex: '#e3e3e3', description: 'Utilisée pour ...', variable: '$border-color' },
  { hex: '#dddddd', description: 'Utilisée pour ...', variable: '$border-dropdown-color' },
  { hex: '#fafafa', description: 'Utilisée pour ...', variable: '$form-bgc' },
  { hex: '#f6f6f6', description: 'Utilisée pour ...', variable: '$page-bgc' },
  { hex: '#acacac', description: 'Utilisée pour ...', variable: '$icon-gray-color' },
  { hex: '#6c757d', description: 'Utilisée pour ...', variable: '$secondary-color' },
  { hex: '#707070', description: 'Utilisée pour ...', variable: '$dark-gray' },
  { hex: '#333333', description: 'Utilisée pour ...', variable: '$dark-text' },
  { hex: '#212529', description: 'Utilisée pour ...', variable: '$dark' },
  { hex: '#dc3545', description: 'Utilisée pour ...', variable: '$danger-color' },
  { hex: '#f0ad4e', description: 'Utilisée pour ...', variable: '$warning-color' },
  { hex: '#0388cc', description: 'Utilisée pour ...', variable: '$primary-color' },
  { hex: '#088A20', description: 'Utilisée pour ...', variable: '$success-color' },
  { hex: '#1D8293', description: 'Utilisée pour ...', variable: '$info-color' },
];

storiesOf('Colors', module).add(
  'Colors',
  () =>
    colors.map(color => (
      <Container>
        <div className="d-flex align-items-center">
          <ColorContainer hex={color.hex} />
          <div>
            <b>{color.hex}</b>
            <br />
            {color.variable}
          </div>
        </div>
        <div className="excerpt small mt-10">{color.description}</div>
      </Container>
    )),
  {
    info: {
      text: `
          Ce composant est utilisé ...
        `,
      source: false,
      propTablesExclude: [ColorContainer, Container],
    },
    options: {
      showAddonPanel: false,
    },
  },
);
