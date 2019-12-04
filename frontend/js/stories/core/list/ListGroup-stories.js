// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem } from 'react-bootstrap';
import { UserAvatarDeprecated } from '../../../components/User/UserAvatarDeprecated';
import InlineList from '../../../components/Ui/List/InlineList';
import ListGroup from '../../../components/Ui/List/ListGroup';
import Media from '../../../components/Ui/Medias/Media/Media';

const author = {
  username: 'admin',
  media: {
    url: 'https://source.unsplash.com/collection/181462',
  },
  _links: {},
  vip: false,
  isViewer: false,
};

storiesOf('Core|List/ListGroup', module).add('default', () => (
  <ListGroup>
    <ListGroupItem>Paragraph</ListGroupItem>
    <ListGroupItem className="d-flex justify-content-between align-items-center">
      <div>Left block</div>
      <div>Center block</div>
      <div>Right block</div>
    </ListGroupItem>
    <ListGroupItem className="list-group-item__opinion">
      <Media>
        <Media.Left>
          <UserAvatarDeprecated user={author} />
        </Media.Left>
        <Media.Body>
          <p>
            <a href="https://ui.cap-collectif.com/?selectedKind=List" className="author-name">
              Lorem ipsum
            </a>{' '}
            <span className="excerpt small">3 juin 2014</span>
          </p>
          <a href="https://ui.cap-collectif.com/?selectedKind=List" className="title">
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua.
          </a>
          <InlineList className="excerpt small">
            <li>Item 1</li>
            <li>Item 2</li>
          </InlineList>
          <div className="actions">
            <Button className="btn-xs">Update</Button>
            <Button bsStyle="success" className="btn-xs btn--outline">
              Agree
            </Button>
          </div>
        </Media.Body>
      </Media>
      <div className="right-block">Right block ...</div>
    </ListGroupItem>
  </ListGroup>
));
