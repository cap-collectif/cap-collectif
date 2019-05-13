// @flow
import * as React from 'react';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroup, ListGroupItem, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { UserAvatar } from '../components/User/UserAvatar';
import InlineList from '../components/Ui/List/InlineList';
import TagsList from '../components/Ui/List/TagsList';
import Tag from '../components/Ui/Labels/Tag';
import ProgressListItem from '../components/Ui/List/ProgressListItem';
import ProgressList from '../components/Ui/List/ProgressList';
import ListGroupFlush from '../components/Ui/List/ListGroupFlush';
import ListGroup from '../components/Ui/List/ListGroup';
import Media from '../components/Ui/Medias/Media/Media';
import Card from '../components/Ui/Card/Card';
import PieChart from '../components/Ui/Chart/PieChart';

const author = {
  username: 'Karim',
  media: {
    url: 'https://source.unsplash.com/collection/181462',
  },
  _links: {},
  vip: false,
};

const opinion = {
  url: 'https://ui.cap-collectif.com/',
  title: 'Opinion',
  user: author,
  createdAt: ' • 1 mars 2018',
  pinned: true,
  publishedAt: ' • 1 mars 2018',
  votes: { totalCount: 4 },
  versions: { totalCount: 3 },
  arguments: { totalCount: 4 },
  sources: { totalCount: 0 },
  votesMitige: { totalCount: 1 },
  votesNok: { totalCount: 1 },
  votesOk: { totalCount: 2 },
};

const opinions = [
  { ...opinion },
  { ...opinion, user: { ...opinion.user, vip: true } },
  { ...opinion, votes: { totalCount: 0 } },
];

const opinionVersion = {
  url: 'https://ui.cap-collectif.com/',
  title: 'Opinion version',
  user: author,
  createdAt: ' • 3 janvier 2015',
  pinned: true,
  publishedAt: ' • 3 janvier 2015',
  votes: { totalCount: 50 },
  arguments: { totalCount: 4 },
  sources: { totalCount: 0 },
  votesMitige: { totalCount: 1 },
  votesNok: { totalCount: 1 },
  votesOk: { totalCount: 2 },
};

const opinionVersions = [
  { ...opinionVersion },
  { ...opinionVersion, user: { ...opinion.user, vip: true } },
  { ...opinionVersion, votes: { totalCount: 0 } },
];

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
              <UserAvatar user={author} />
            </Media.Left>
            <Media.Body>
              <p>
                <a
                  href="https://ui.cap-collectif.com/?selectedKind=List"
                  className="author-name excerpt_dark">
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
  )
  .add('Opinion list', () => (
    <ListGroup>
      {opinions.map((item, index) => (
        <ListGroupItem
          key={index}
          className={`list-group-item__opinion text-left has-chart${
            item.user && item.user.vip ? ' bg-vip' : ''
          }`}>
          <Media>
            <Media.Left>
              <UserAvatar user={item.user} />
            </Media.Left>
            <Media.Body>
              <div className="opinion__user">
                <a href="https://ui.cap-collectif.com" className="excerpt_dark">
                  {item.user.username}
                </a>
                <span className="excerpt small">{item.createdAt}</span>
                {item.pinned && (
                  <span className="opinion__label opinion__label--blue">
                    <i className="cap cap-pin-1" /> Label
                  </span>
                )}
                <span className="text-label text-label--green ml-10">
                  <i className="cap cap-trophy" /> Label
                </span>
              </div>
              <Card.Title tagName="div" firstElement={false}>
                <a href={opinion.url}>{opinion.title}</a>
              </Card.Title>
              <InlineList className="excerpt small">
                <li>{`${item.votes.totalCount} votes`}</li>
                <li>{`${item.versions.totalCount} amendements`}</li>
                <li>{`${item.arguments.totalCount} arguments`}</li>
                <li>{`${item.sources.totalCount} source`}</li>
              </InlineList>
            </Media.Body>
          </Media>
          {item.votes.totalCount > 0 && (
            <PieChart
              data={[
                { name: "D'accord", value: item.votesOk.totalCount },
                { name: 'Mitigé', value: item.votesMitige.totalCount },
                { name: "Pas d'accord", value: item.votesNok.totalCount },
              ]}
              colors={['#5cb85c', '#f0ad4e', '#d9534f']}
            />
          )}
        </ListGroupItem>
      ))}
      <ListGroupItem className="bg-white">
        <Button id="OpinionListPaginated-loadmore" bsStyle="link" onClick={() => {}}>
          Voir toutes les propositions
        </Button>
      </ListGroupItem>
    </ListGroup>
  ))
  .add('Opinion version list', () => (
    <ListGroup>
      {opinionVersions.map((item, index) => (
        <ListGroupItem
          key={index}
          className={`list-group-item__opinion text-left has-chart${
            item.user && item.user.vip ? ' bg-vip' : ''
          }`}>
          <Media>
            <Media.Left>
              <UserAvatar user={item.user} />
            </Media.Left>
            <Media.Body>
              <div className="opinion__user">
                <a href="https://ui.cap-collectif.com" className="excerpt_dark">
                  {item.user.username}
                </a>
                <span className="excerpt small">{item.createdAt}</span>
                {item.pinned && (
                  <span className="opinion__label opinion__label--blue">
                    <i className="cap cap-pin-1" /> Label
                  </span>
                )}
                <span className="text-label text-label--green ml-10">
                  <i className="cap cap-trophy" /> Label
                </span>
              </div>
              <Card.Title tagName="div" firstElement={false}>
                <a href={opinion.url}>{opinion.title}</a>
              </Card.Title>
              <InlineList className="excerpt small">
                <li>{`${item.votes.totalCount} votes`}</li>
                <li>{`${item.arguments.totalCount} arguments`}</li>
                <li>{`${item.sources.totalCount} source`}</li>
              </InlineList>
            </Media.Body>
          </Media>
          {item.votes.totalCount > 0 && (
            <PieChart
              data={[
                { name: "D'accord", value: item.votesOk.totalCount },
                { name: 'Mitigé', value: item.votesMitige.totalCount },
                { name: "Pas d'accord", value: item.votesNok.totalCount },
              ]}
              colors={['#5cb85c', '#f0ad4e', '#d9534f']}
            />
          )}
        </ListGroupItem>
      ))}
      <ListGroupItem className="bg-white">
        <Button id="OpinionListPaginated-loadmore" bsStyle="link" onClick={() => {}}>
          Voir toutes les amendements
        </Button>
      </ListGroupItem>
    </ListGroup>
  ));
