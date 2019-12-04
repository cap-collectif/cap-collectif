// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, select } from 'storybook-addon-knobs';
import { Panel } from 'react-bootstrap';

const panelStyleOptions = {
  Blue: 'panel--blue',
  Red: 'panel--red',
  Orange: 'panel--orange',
  Green: 'panel--green',
  Gray: 'panel--gray',
  Lightgray: 'panel--lightgray',
  Bluedark: 'panel--bluedark',
  Null: '',
};

storiesOf('Core|Panel', module).add(
  'Panel',
  () => {
    const titleComponent = text('Title component', 'h3');
    const headerActionsContent = text('Header actions content', 'Actions');
    const bodyContent = text('Body content', 'Body');
    const footerContent = text('Footer content', 'Footer');
    const panelStyle = select('Panel style', panelStyleOptions, '');

    Panel.displayName = 'Panel';
    Panel.Heading.displayName = 'Panel.Heading';
    Panel.Title.displayName = 'Panel.Title';
    Panel.Body.displayName = 'Panel.Body';
    Panel.Footer.displayName = 'Panel.Footer';

    return (
      <Panel className={`${panelStyle} panel-custom`}>
        <Panel.Heading>
          <Panel.Title componentClass={titleComponent}>Panel heading</Panel.Title>
          <div className="panel-heading__actions">{headerActionsContent}</div>
        </Panel.Heading>
        <Panel.Body>{bodyContent}</Panel.Body>
        <Panel.Footer>{footerContent}</Panel.Footer>
      </Panel>
    );
  },
  {
    info: {},
  },
);
