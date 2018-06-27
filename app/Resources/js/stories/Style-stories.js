// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import { FontStyle } from './FontStyle';

export const ColorContainer = styled.div`
  height: 50px;
  width: 100%;
  margin-bottom: 20px;
  border: 1px solid #e3e3e3;
  background-color: ${props => props.hex}
`;

const colors = [
  { hex: '#e3e3e3', description:'$border-color' },
  { hex: '#dddddd', description:'$border-dropdown-color' },
  { hex: '#fafafa', description:'$form-bgc' },
  { hex: '#f6f6f6', description:'$page-bgc' },
  { hex: '#acacac', description:'$icon-gray-color' },
  { hex: '#6c757d', description:'$secondary-color' },
  { hex: '#707070', description:'$dark-gray' },
  { hex: '#333333', description:'$dark-text' },
  { hex: '#212529', description:'$dark' },
  { hex: '#dc3545', description:'$danger-color' },
  { hex: '#f0ad4e', description:'$warning-color' },
  { hex: '#0388cc', description:'$primary-color' },
  { hex: '#088A20', description:'$success-color' },
  { hex: '#1D8293', description:'$info-color' },
];

storiesOf('UI', module)
  .add('Fonts',() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Fonts {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Style-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <FontStyle />
      </div>
    );
  })
  .add('Colors',() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Colors {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Style-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <div className="row">
          {colors.map(color => (
            <div className="col-sm-2 col-xs-12 mb-20">
              <ColorContainer hex={color.hex} />
              <div className="text-center">
                <b>{color.hex}</b><br />
                {color.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });
