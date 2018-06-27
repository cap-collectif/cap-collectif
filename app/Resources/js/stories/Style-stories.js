// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Label, Alert, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import styled from 'styled-components';
import { FontStyle } from './FontStyle';
import { AlertForm } from "../components/Alert/AlertForm";

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

const labels = ['default','primary','success','warning','danger','info'];
const buttons = ['default','primary','success','warning','danger','info','link'];
const alerts = ['success','warning','danger','info'];

const alertFormProps = [
  { description: 'Custom error message', values: { valid:false, errorMessage:"My message", invalid:true, submitSucceeded:true, submitFailed:true, submitting:false }},
  { description: 'Submit succeeded (disappear after 10s)', values: { valid:true, invalid:false, submitSucceeded:true, submitFailed:false, submitting:false}},
  { description: 'Submit failed', values: { valid:true, invalid:false, submitSucceeded:false, submitFailed:true, submitting:false}},
  { description: 'Invalid form', values: { valid:false, invalid:true, submitSucceeded:true, submitFailed:false, submitting:false}},
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
  })
  .add('Labels',() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Labels {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Style-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <div className="row">
          {labels.map(label => (
            <div className="col-sm-1 col-xs-6 mb-20">
              <Label bsStyle={label}>{label}</Label>
            </div>
          ))}
        </div>
      </div>
    );
  })
  .add('Alerts',withInfo({
    source: false,
    text :`
      <h2>How to use</h2>
    
      ~~~jsx
      // Basic alert
      <Alert bsStyle="success">My alert</Alert>
      
      // Form alert
      <Pagination
        <AlertForm
          valid
          invalid={false}
          submitting={false}
          submitSucceeded={false}
          submitFailed={false}
        />
      />
      ~~~
    
    `})(() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Alerts {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Style-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <h3>Basic alert</h3>
        <div className="row">
          {alerts.map(alert => (
            <div className="col-sm-3 col-xs-12 mb-10">
              <Alert bsStyle={alert}>{alert} alert</Alert>
            </div>
          ))}
        </div>
        <h3>Form alert</h3>
          {alertFormProps.map(props => (
            <div className="mb-20">
              <p>{props.description}</p>
              <AlertForm
                {...props.values}
              />
            </div>
          ))}
      </div>
    );
  }))
  .add('Buttons',() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Labels {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Style-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <div className="row">
          {buttons.map(button => (
            <div className="col-sm-1 col-xs-6 mb-20">
              <Button bsStyle={button}>{button}</Button>
            </div>
          ))}
          <div>
            <DropdownButton
              bsStyle="primary"
              title="dropdown button"
              key="1"
              id="dropdown-basic"
            >
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>
                Active Item
              </MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </div>
        </div>
      </div>
    );
  });
