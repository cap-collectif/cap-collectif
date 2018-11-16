// @flow
import * as React from 'react';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { UserAvatar } from '../components/User/UserAvatar';
import InlineList from '../components/Ui/List/InlineList';
import TagsList from '../components/Ui/List/TagsList';
import ProgressListItem from '../components/Ui/List/ProgressListItem';
import ProgressList from '../components/Ui/List/ProgressList';
import ListGroupFlush from '../components/Ui/List/ListGroupFlush';

const author = {
  username: 'Karim',
  media: {
    url: 'https://source.unsplash.com/collection/181462',
  },
  _links: {},
};

storiesOf('List', module)
  .addDecorator(withKnobs)
  .add(
    'Inline list',
    () => (
      <InlineList>
        <li>5 projets</li>
        <li>10 articles</li>
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
        <div className="tags-list__tag">
          <i className="cap cap-marker-1-1 icon--blue" />5 projets
        </div>
        <div className="tags-list__tag">
          <i className="cap cap-tag-1-1 icon--blue" />
          10 articles
        </div>
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
      <ListGroup className="list-group-custom">
        <ListGroupItem>Paragraph</ListGroupItem>
        <ListGroupItem>
          <div>Left block</div>
          <div>Center block</div>
          <div>Right block</div>
        </ListGroupItem>
        <ListGroupItem className="list-group-item__opinion">
          <div className="left-block">
            <UserAvatar defaultAvatar={null} user={author} />
            <div>
              <p>
                {/* <a href="#" className="author-name"> */}
                {/* Lorem ipsum */}
                {/* </a>{' '} */}
                <span className="excerpt">3 juin 2014</span>
              </p>
              <h3 className="title">
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua.
              </h3>
              <InlineList>
                <li>Item 1</li>
                <li>Item 2</li>
              </InlineList>
              <div className="actions">
                <Button className="btn-xs">Update</Button>
                <Button bsStyle="success" className="btn-xs btn--outline">
                  Agree
                </Button>
              </div>
            </div>
          </div>
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
