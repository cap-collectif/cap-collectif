// @flow
import * as React from 'react';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { UserAvatarDeprecated } from '../components/User/UserAvatarDeprecated';
import InlineList from '../components/Ui/List/InlineList';
import TagsList from '../components/Ui/List/TagsList';
import Tag from '../components/Ui/Labels/Tag';
import ProgressListItem from '../components/Ui/List/ProgressListItem';
import ProgressList from '../components/Ui/List/ProgressList';
import ListGroupFlush from '../components/Ui/List/ListGroupFlush';
import ListGroup from '../components/Ui/List/ListGroup';
import Media from '../components/Ui/Medias/Media/Media';

const author = {
  username: 'admin',
  media: {
    url: 'https://source.unsplash.com/collection/181462',
  },
  _links: {},
  vip: false,
  isViewer: false,
};

storiesOf('List', module)
  .addDecorator(withKnobs)
  .add(
    'Inline list',
    () => (
      <InlineList>
        <li>5 projets</li>
        <li>
          <a href="https://ui.cap-collectif.com/?selectedKind=List">10 articles</a>
        </li>
        <li>2 évènements</li>
      </InlineList>
    ),
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Tags list',
    () => (
      <TagsList>
        <Tag icon="cap cap-marker-1-1 icon--blue">5 projets</Tag>
        <Tag icon="cap cap-tag-1-1 icon--blue">10 articles</Tag>
        <OverlayTrigger placement="top" overlay={<Tooltip>Exemple tooltip</Tooltip>}>
          <Tag icon="cap cap-lock-2-1 mr-1">Accès restreint</Tag>
        </OverlayTrigger>
      </TagsList>
    ),
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Progress list',
    () => {
      const isActive = boolean('First item is active', true);

      return (
        <ProgressList>
          <ProgressListItem item={{ title: 'Step 1', isActive }} />
          <ProgressListItem item={{ title: 'Step 2', isActive: false }} />
        </ProgressList>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'List Group',
    () => (
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
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua.
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
    ),
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'List Group flush',
    () => (
      <ListGroupFlush>
        <ListGroupItem>Paragraph 1</ListGroupItem>
        <ListGroupItem>Paragraph 2</ListGroupItem>
        <ListGroupItem>
          <div>Left block</div>
          <div>Center block</div>
          <div>Right block</div>
        </ListGroupItem>
      </ListGroupFlush>
    ),
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  );
