// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import {
  Label,
  Button,
  Modal,
  Panel,
  FormControl,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import Pagination from '../components/Utils/Pagination';
import InlineList from '../components/Ui/List/InlineList';
import DarkenGradientMedia from '../components/Ui/DarkenGradientMedia';
import SixteenNineMedia from '../components/Ui/SixteenNineMedia';
import { UserAvatar } from '../components/User/UserAvatar';

const labels = ['default', 'primary', 'success', 'warning', 'danger', 'info'];

const author = {
  username: 'Karim',
  media: {
    url: 'https://source.unsplash.com/collection/181462',
  },
  _links: {},
};

storiesOf('Components', module)
  .add(
    'Pagination',
    withInfo({
      source: false,
      text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      // Inline list
      <Pagination
        nbPages={6}
        current={3}
        onChange={() => {}}
      />
      ~~~
    
    `,
    })(() => (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Pagination{' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
            <i className="small cap cap-github" />
          </a>
        </h1>
        <hr />
        <div className="row">
          <Pagination nbPages={6} current={3} onChange={() => {}} />
        </div>
      </div>
    )),
  )
  .add(
    'Labels',
    withInfo({
      source: false,
      text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      <Label bsStyle={labelStyle}>{label}</Label>
      ~~~
    
    `,
    })(() => (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Labels{' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
            <i className="small cap cap-github" />
          </a>
        </h1>
        <hr />
        <div className="row">
          {labels.map(label => (
            <div className="col-sm-1 col-xs-6 mb-20">
              <Label bsStyle={label}>{label}</Label>
            </div>
          ))}
        </div>
      </div>
    )),
  )
  .add(
    'Modal',
    withInfo({
      source: false,
      propTablesExclude: [Button],
      text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Titre</Modal.Title>
          </Modal.Header>
      
          <Modal.Body>Lorem ipsum...</Modal.Body>
      
          <Modal.Footer>
            <Button>Fermer</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>;
      ~~~
    
    `,
    })(() => (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Modal{' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
            <i className="small cap cap-github" />
          </a>
        </h1>
        <hr />
        <div className="static-modal position-relative">
          <Modal.Dialog className="position-relative">
            <Modal.Header>
              <Modal.Title>Titre</Modal.Title>
            </Modal.Header>

            <Modal.Body>Lorem ipsum ...</Modal.Body>

            <Modal.Footer>
              <Button>Fermer</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </div>
      </div>
    )),
  )
  .add(
    'Media',
    withInfo({
      source: false,
      propTablesExclude: [Button],
      text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      // Darken gradient media
      <DarkenGradientMedia
        width="600px"
        height="400px"
        url="https://source.unsplash.com/collection/1353633"
        title="title"
      />
      
      // Sixteen  Nine Media
      <SixteenNineMedia> // depends on parent size
        <img src="https://source.unsplash.com/collection/1353633" alt="img example"/>
      </SixteenNineMedia>
      
      // User avatar
      <UserAvatar user={author}/>
      ~~~
    
    `,
    })(() => (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Media{' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
            <i className="small cap cap-github" />
          </a>
        </h1>
        <hr />
        <h3>Darken gradient media</h3>
        <DarkenGradientMedia
          width="600px"
          height="400px"
          url="https://source.unsplash.com/collection/1353633"
          title="title"
        />
        <h3>16:9 media</h3>
        <div style={{ maxWidth: '400px' }} className="mb-30">
          <SixteenNineMedia>
            <img src="https://source.unsplash.com/collection/1353633" alt="img example" />
          </SixteenNineMedia>
        </div>
        <h3>User avatar</h3>
        <UserAvatar user={author} defaultAvatar={null} />
      </div>
    )),
  )
  .add(
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
