// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Button, Panel, FormControl, ListGroup, ListGroupItem } from 'react-bootstrap';
import InlineList from '../components/Ui/List/InlineList';
import { UserAvatar } from '../components/User/UserAvatar';

storiesOf('Components', module).add(
  'Panel',
  withInfo({
    source: false,
    propTablesExclude: [Button, FormControl, UserAvatar, InlineList, ListGroup, ListGroupItem],
    text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      <Panel className="panel-custom">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Panel heading</Panel.Title>
          <div className="panel-heading__actions"> // create this div if you have more than 1 element
            <FormControl componentClass="select" placeholder="select">
              <option value="select">select</option>
              <option value="other">...</option>
            </FormControl>
            <Button>My button</Button>
          </div>
        </Panel.Heading>
        <Panel.Body>Panel content</Panel.Body>
        <ListGroup className="list-group-custom">
            <ListGroupItem>
              <p>Alone item</p>
            </ListGroupItem>
          <ListGroupItem>
          <a href="https://ui.cap-collectif.com" className="d-flex"> // center title with flex
            <h3>My title</h3>
          </a>
          </ListGroupItem>
        </ListGroup>
        <Panel.Footer>Panel footer</Panel.Footer>
      </Panel>
      
      // panel with color
      <Panel className="panel-custom panel--blue">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Blue panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      ~~~
    
    `,
  })(() => (
    <div className="ml-30 mr-30 storybook-container">
      <h1>
        Panel{' '}
        <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
          <i className="small cap cap-github" />
        </a>
      </h1>
      <hr />
      <Panel className="panel-custom">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Panel heading [default]</Panel.Title>
          <div className="panel-heading__actions">
            <FormControl componentClass="select" placeholder="select">
              <option value="select">select</option>
              <option value="other">...</option>
            </FormControl>
            <Button>My button</Button>
          </div>
        </Panel.Heading>
        <Panel.Body>
          <p>panel body</p>
        </Panel.Body>
        <ListGroup className="list-group-custom">
          <ListGroupItem>
            <p>Alone item</p>
          </ListGroupItem>
          <ListGroupItem>
            <a href="https://ui.cap-collectif.com" className="d-flex">
              <h3>My item</h3>
            </a>
            <Button>My button</Button>
          </ListGroupItem>
        </ListGroup>
        <Panel.Footer>Panel footer</Panel.Footer>
      </Panel>
      <Panel className="panel-custom panel--blue">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Blue panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      <Panel className="panel-custom panel--red">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Red panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      <Panel className="panel-custom panel--orange">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Orange panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      <Panel className="panel-custom panel--green">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Green panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      <Panel className="panel-custom panel--gray">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Gray panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      <Panel className="panel-custom panel--lightgray">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Lightgray panel</Panel.Title>
        </Panel.Heading>
      </Panel>
      <Panel className="panel-custom panel--bluedark">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Bluedark panel</Panel.Title>
        </Panel.Heading>
      </Panel>
    </div>
  )),
);
