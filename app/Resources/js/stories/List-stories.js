// @flow
import * as React from 'react';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroup, ListGroupItem, Tooltip, MenuItem, OverlayTrigger } from 'react-bootstrap';
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
  username: 'admin',
  media: {
    url: 'https://source.unsplash.com/collection/181462',
  },
  _links: {},
  vip: false,
  isViewer: false,
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

const argument = {
  user: author,
  trashedStatus: '',
  createdAt: '1 mars 2016 à 00:00',
  publishedAt: '1 mars 2016 à 00:00',
  body:
    'In placeat reiciendis ut. Officiis praesentium quia minima ut tenetur officiis. Eaque fugit voluptates temporibus suscipit provident culpa culpa. Magni recusandae dolorem aut id.',
  votes: { totalCount: 50 },
};

const argumentsData = [
  { ...argument, user: { ...argument.user, vip: true } },
  { ...argument },
  { ...argument, trashedStatus: 'INVISIBLE' },
  { ...argument },
];

const source = {
  url: 'https://ui.cap-collectif.com/',
  user: author,
  createdAt: ' • 1 mars 2016',
  publishedAt: ' • 1 mars 2016',
  title: 'Source title',
  body:
    'In placeat reiciendis ut. Officiis praesentium quia minima ut tenetur officiis. Eaque fugit voluptates temporibus suscipit provident culpa culpa. Magni recusandae dolorem aut id.',
  votes: { totalCount: 2 },
};

const sources = [{ ...source }, { ...source, user: { ...source.user, vip: true } }, { ...source }];

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
                <a href={item.url}>{item.title}</a>
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
  ))
  .add('Argument list', () => (
    <ListGroup>
      {argumentsData.map((item, index) => (
        <ListGroupItem
          key={index}
          className={`opinion opinion--argument ${item.user && item.user.vip ? ' bg-vip' : ''}`}>
          {
            <div className="opinion__body">
              <UserAvatar user={item.user} className="pull-left" />
              {item.trashedStatus === 'INVISIBLE' ? (
                <div>Contenu caché</div>
              ) : (
                <div className="opinion__data">
                  <p className="h5 opinion__user">
                    <a href="https://ui.cap-collectif.com" className="excerpt_dark">
                      {item.user.username}
                    </a>
                    <p className="excerpt opinion__date">{item.createdAt || item.publishedAt}</p>
                  </p>
                </div>
              )}
              <p
                className="opinion__text"
                style={{
                  overflow: 'hidden',
                  float: 'left',
                  width: '100%',
                  wordWrap: 'break-word',
                }}>
                {argument.body}
              </p>
              <div>
                <span>
                  <form style={{ display: 'inline-block' }}>
                    <Button
                      className={`argument__btn--vote btn--outline'}`}
                      bsStyle="success"
                      bsSize="xsmall"
                      onClick={() => {}}>
                      {"D'accord"}
                    </Button>
                  </form>{' '}
                  <span className="opinion__votes-nb">{argument.votes.totalCount}</span>
                </span>
                <span>
                  <Button
                    className="btn--outline btn-dark-gray argument__btn--report"
                    bsSize="xs"
                    onClick={() => {}}>
                    <i className="cap cap-flag-1" /> {'Signaler'}
                  </Button>
                </span>{' '}
                <div className="share-button-dropdown">
                  <DropdownButton
                    className="argument__btn--share btn-dark-gray btn--outline btn btn-xs dropdown--custom"
                    bsSize="xs"
                    onClick={() => {}}
                    title={
                      <span>
                        <i className="cap cap-link" /> {'Partager'}
                      </span>
                    }>
                    <MenuItem eventKey="1">
                      <i className="cap cap-mail-2-1" /> {'Mail'}
                    </MenuItem>
                    <MenuItem eventKey="2">
                      <i className="cap cap-facebook" /> {'Facebook'}
                    </MenuItem>
                    <MenuItem eventKey="3">
                      <i className="cap cap-twitter" /> {'Twitter'}
                    </MenuItem>
                    <MenuItem eventKey="4">
                      <i className="cap cap-linkedin" /> {'LinkedIn'}
                    </MenuItem>
                    <MenuItem eventKey="5">
                      <i className="cap cap-link-1" /> {'Link'}
                    </MenuItem>
                  </DropdownButton>
                </div>
              </div>
            </div>
          }
        </ListGroupItem>
      ))}
      <ListGroupItem style={{ textAlign: 'center' }}>
        <Button id="OpinionListPaginated-loadmore" bsStyle="link" onClick={() => {}}>
          Voir plus
        </Button>
      </ListGroupItem>
    </ListGroup>
  ))
  .add('Source list', () => (
    <ListGroup id="sources-list">
      {sources.map((item, index) => (
        <ListGroupItem
          key={index}
          id={`source-${index}`}
          className={`list-group-item__opinion ${item.user && item.user.vip ? ' bg-vip' : ''}`}>
          <Media>
            <Media.Left>
              <UserAvatar user={item.user} className="pull-left" />
            </Media.Left>
            <Media.Body>
              <div className="opinion__user">
                <a href="https://ui.cap-collectif.com" className="excerpt_dark">
                  {item.user.username}
                </a>
                <span className="excerpt small">{item.createdAt}</span>
              </div>
              <Card.Title tagName="div" firstElement={false}>
                <a href={item.url}>{item.title}</a>
              </Card.Title>
              <p
                className="opinion__text"
                style={{
                  overflow: 'hidden',
                  float: 'left',
                  width: '100%',
                  wordWrap: 'break-word',
                }}>
                <div className="ql-editor">{item.body}</div>
              </p>
              <div className="small">
                <span>
                  <form style={{ display: 'inline-block' }}>
                    <Button
                      className={`argument__btn--vote btn--outline'}`}
                      bsStyle="success"
                      bsSize="xsmall"
                      onClick={() => {}}>
                      {"D'accord"}
                    </Button>
                  </form>{' '}
                  <Button className="btn--outline btn-dark-gray btn-xs opinion__votes-nb">
                    {source.votes.totalCount}
                  </Button>
                </span>{' '}
                <span>
                  <Button
                    className="btn--outline btn-dark-gray argument__btn--report"
                    bsSize="xs"
                    onClick={() => {}}>
                    <i className="cap cap-flag-1" /> {'Signaler'}
                  </Button>
                </span>{' '}
                <div className="share-button-dropdown">
                  <DropdownButton
                    className="argument__btn--share btn-dark-gray btn--outline btn btn-xs dropdown--custom"
                    bsSize="xs"
                    onClick={() => {}}
                    title={
                      <span>
                        <i className="cap cap-link" /> {'Partager'}
                      </span>
                    }>
                    <MenuItem eventKey="1">
                      <i className="cap cap-mail-2-1" /> {'Mail'}
                    </MenuItem>
                    <MenuItem eventKey="2">
                      <i className="cap cap-facebook" /> {'Facebook'}
                    </MenuItem>
                    <MenuItem eventKey="3">
                      <i className="cap cap-twitter" /> {'Twitter'}
                    </MenuItem>
                    <MenuItem eventKey="4">
                      <i className="cap cap-linkedin" /> {'LinkedIn'}
                    </MenuItem>
                    <MenuItem eventKey="5">
                      <i className="cap cap-link-1" /> {'Link'}
                    </MenuItem>
                  </DropdownButton>
                </div>
              </div>
            </Media.Body>
          </Media>
        </ListGroupItem>
      ))}
      <ListGroupItem style={{ textAlign: 'center' }}>
        <Button bsStyle="link" onClick={() => {}}>
          Voir plus
        </Button>
      </ListGroupItem>
    </ListGroup>
  ));
