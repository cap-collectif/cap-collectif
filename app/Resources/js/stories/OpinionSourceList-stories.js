// @flow
import * as React from 'react';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem, Label, Media, Panel, Row, Col } from 'react-bootstrap';
import { UserAvatarDeprecated } from '../components/User/UserAvatarDeprecated';
import ListGroup from '../components/Ui/List/ListGroup';
import Card from '../components/Ui/Card/Card';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';
import { opinionSources as opinionSourcesMock } from './mocks/opinionSources';

// eslint-disable-next-line react/prop-types
const OpinionSourceItem = ({ item, isProfile, typeLabel }) => (
  <Media>
    {isProfile && item.related && (
      <p>
        {'Lié à la proposition : '}
        <a href={item.related.url}>{item.related.title}</a>
      </p>
    )}
    <Media.Left>
      <UserAvatarDeprecated user={item.user} />
    </Media.Left>
    <Media.Body className="opinion__body">
      <div className="opinion__user">
        <a href="https://ui.cap-collectif.com" className="excerpt_dark">
          {item.user.username}
        </a>
        <span className="excerpt small">{item.createdAt}</span>
        {typeLabel && (
          <React.Fragment>
            {' '}
            <Label>{typeLabel}</Label>
          </React.Fragment>
        )}
      </div>
      {item.trashedStatus === 'INVISIBLE' ? (
        <div className="opinion__text">[Contenu masqué]</div>
      ) : (
        <React.Fragment>
          <Card.Title tagName="h3" firstElement={false}>
            {item.category && (
              <React.Fragment>
                <Label bsStyle="primary">{item.category}</Label>{' '}
              </React.Fragment>
            )}
            <a href={item.url}>{item.title}</a>
          </Card.Title>
          <p className="opinion__text">
            <div className="ql-editor">{item.body}</div>
          </p>
        </React.Fragment>
      )}
      <div className="small">
        <span>
          <form className="opinion__votes-button">
            <Button
              disabled={!item.contribuable || (item.user && item.user.isViewer)}
              bsStyle={item.viewerHasVote ? 'danger' : 'success'}
              className={`source__btn--vote${item.viewerHasVote ? '' : ' btn--outline'}`}
              bsSize="xsmall"
              onClick={() => {}}>
              {item.viewerHasVote ? (
                <span>Annuler</span>
              ) : (
                <span>
                  <i className="cap cap-hand-like-2" /> {"D'accord"}
                </span>
              )}
            </Button>
          </form>
          <span className="opinion__votes-nb">{item.votes.totalCount}</span>
        </span>
        {item.user && !item.user.isViewer && (
          <React.Fragment>
            <span>
              <Button
                className="btn--outline btn-dark-gray source__btn--report"
                active={item.reported}
                disabled={item.reported}
                bsSize="xs"
                onClick={() => {}}>
                <i className="cap cap-flag-1" /> {item.reported ? 'Signalé' : 'Signaler'}
              </Button>
            </span>{' '}
          </React.Fragment>
        )}
        {item.user && item.user.isViewer && (
          <React.Fragment>
            <button
              className="source__btn--edit btn btn-xs btn-dark-gray btn--outline"
              onClick={() => {}}>
              <i className="cap cap-pencil-1" /> Modifier
            </button>{' '}
          </React.Fragment>
        )}
        {item.user && item.user.isViewer && (
          <React.Fragment>
            <button
              className="source__btn--delete btn btn-xs btn-danger btn--outline"
              onClick={() => {}}>
              <i className="cap cap-bin-2" /> Supprimer
            </button>{' '}
          </React.Fragment>
        )}
      </div>
    </Media.Body>
  </Media>
);

// eslint-disable-next-line react/prop-types
const OpinionSourceList = ({ section, opinionSources, isProfile }) => (
  <div>
    <Panel>
      <Panel.Heading>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <Button
              id="source-form__add"
              disabled={!section.addSourceEnable}
              bsStyle="primary"
              onClick={() => {}}>
              <i className="cap cap-add-1" /> Proposer une source
            </Button>
          </Col>
          {opinionSources.length > 1 && (
            <Col xs={12} sm={6} md={6}>
              <form className="form-inline">
                <select className="form-control pull-right" onBlur={() => {}}>
                  <option value="last">Les plus récentes</option>
                  <option value="old">Les plus anciennes</option>
                  <option value="popular">Les plus populaires</option>
                </select>
              </form>
            </Col>
          )}
        </Row>
      </Panel.Heading>
      {section.isLoading && <Loader />}
      {!section.isLoading &&
        (opinionSources.length === 0 ? (
          <Panel.Body className="text-center excerpt">
            <i className="cap-32 cap-baloon-1" />
            <br />
            Aucune source proposée
          </Panel.Body>
        ) : (
          <ListGroup id="sources-list">
            {opinionSources.map((item, index) => (
              <ListGroupItem
                key={index}
                id={`source-${index}`}
                className={`list-group-item__opinion opinion ${
                  item.user && item.user.vip ? ' bg-vip' : ''
                }`}
                style={{ backgroundColor: item.user && item.user.vip ? '#F7F7F7' : undefined }}>
                <OpinionSourceItem
                  item={item}
                  isProfile={isProfile}
                  typeLabel={section.typeLabel}
                />
              </ListGroupItem>
            ))}
            {!section.isLoading && section.paginationEnable && (
              <ListGroupItem className="text-center">
                {section.isLoadingMore && <Loader size={28} inline />}
                {!section.isLoadingMore && (
                  <Button bsStyle="link" block onClick={() => {}}>
                    {'Voir plus de sources'}
                  </Button>
                )}
              </ListGroupItem>
            )}
          </ListGroup>
        ))}
    </Panel>
  </div>
);

storiesOf('OpinionSourceList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const section = {
      addSourceEnable: boolean('Add source enabled', true, 'Section'),
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return (
      <OpinionSourceList section={section} opinionSources={opinionSourcesMock} isProfile={false} />
    );
  })
  .add('empty', () => {
    const section = {
      addSourceEnable: boolean('Add source enabled', true, 'Section'),
      paginationEnable: boolean('Pagination enabled', false, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
    };

    return <OpinionSourceList section={section} opinionSources={[]} isProfile={false} />;
  })
  .add('with single opinion source', () => {
    const section = {
      addSourceEnable: boolean('Add source enabled', true, 'Section'),
      paginationEnable: boolean('Pagination enabled', false, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return (
      <OpinionSourceList
        section={section}
        opinionSources={[opinionSourcesMock[0]]}
        isProfile={false}
      />
    );
  })
  .add('in profile', () => {
    const section = {
      addSourceEnable: boolean('Add source enabled', true, 'Section'),
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', true, 'Section'),
    };

    return <OpinionSourceList section={section} opinionSources={opinionSourcesMock} isProfile />;
  })
  .add('in trash', () => {
    const section = {
      addSourceEnable: boolean('Add source enabled', true, 'Section'),
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      typeLabel: text('Type label', 'Dans la corbeille', 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return (
      <OpinionSourceList section={section} opinionSources={opinionSourcesMock} isProfile={false} />
    );
  });
