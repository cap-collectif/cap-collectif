// @flow
import * as React from 'react';
import { boolean, select, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import {
  Button,
  ListGroupItem,
  Panel,
  DropdownButton,
  MenuItem,
  Label,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import Input from '../components/Form/Input';
import { UserAvatar } from '../components/User/UserAvatar';
import ListGroup from '../components/Ui/List/ListGroup';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';
import { opinionArguments as opinionArgumentsMock } from './mocks/opinionArguments';

const OpinionArgumentItem = ({ item, argumentType, isProfile }) => (
  <React.Fragment>
    <div className="opinion__body">
      <UserAvatar user={item.user} className="pull-left" />
      {item.trashedStatus === 'INVISIBLE' ? (
        <div>[Contenu masqué]</div>
      ) : (
        <div className="opinion__data">
          <p className="h5 opinion__user">
            {item.user && (
              <a href="https://ui.cap-collectif.com" className="excerpt_dark">
                {item.user.username}
              </a>
            )}
            {!item.user && <span>Utilisateur supprimé</span>}
            {isProfile && (
              <Label
                bsStyle={argumentType === 'FOR' ? 'success' : 'danger'}
                className="label--right">
                {argumentType === 'FOR' ? 'pour' : 'contre'}
              </Label>
            )}
          </p>
          <p className="excerpt opinion__date">{item.createdAt || item.publishedAt}</p>
          {!item.published && (
            <React.Fragment>
              {' '}
              <OverlayTrigger
                placement="top"
                overlay={
                  <Popover title={<strong>Compte en attente de confirmation</strong>}>
                    <p>
                      {
                        'Votre opinion n’a pas été publié, car votre compte a été confirmé après la date de fin de l’étape.'
                      }
                    </p>
                  </Popover>
                }>
                <Label bsStyle="danger" className="ellipsis d-ib mw-100 mt-5">
                  <i className="cap cap-delete-2" /> Non comptabilisé
                </Label>
              </OverlayTrigger>
            </React.Fragment>
          )}
          {isProfile && item.related && (
            <p>
              {'Lié à la proposition : '}
              <a href={item.related.url}>{item.related.title}</a>
            </p>
          )}
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
        {item.body}
      </p>
      <div>
        <span>
          <form style={{ display: 'inline-block' }}>
            <Button
              disabled={!item.contribuable || (item.user && item.user.isViewer)}
              bsStyle={item.viewerHasVote ? 'danger' : 'success'}
              className={`argument__btn--vote${item.viewerHasVote ? '' : ' btn--outline'}`}
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
          </form>{' '}
          <span className="opinion__votes-nb">{item.votes.totalCount}</span>
        </span>
        {item.user && !item.user.isViewer && (
          <React.Fragment>
            <span>
              <Button
                className="btn--outline btn-dark-gray argument__btn--report"
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
              className="argument__btn--edit btn btn-xs btn-dark-gray btn--outline"
              onClick={() => {}}>
              <i className="cap cap-pencil-1" /> Modifier
            </button>{' '}
          </React.Fragment>
        )}
        {item.user && item.user.isViewer && (
          <React.Fragment>
            <button
              className="argument__btn--delete btn btn-xs btn-danger btn--outline"
              onClick={() => {}}>
              <i className="cap cap-bin-2" /> Supprimer
            </button>{' '}
          </React.Fragment>
        )}
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
  </React.Fragment>
);

const OpinionArgumentList = ({ section, isProfile, opinionArguments }) => (
  <div id={`opinion__arguments--${section.argumentType}`} className="block--tablet">
    {section.isLoading ? (
      <Loader />
    ) : (
      <Panel className="panel--white panel-custom">
        <Panel.Heading>
          <Panel.Title componentClass="h4" className="opinion__header__title d-flex">
            <span>{`${opinionArguments.length} arguments {${section.argumentType}}`}</span>
          </Panel.Title>
          {opinionArguments.length > 1 && (
            <div className="panel-heading__actions">
              <Input
                type="select"
                id={`filter-arguments-${section.argumentType}`}
                label={<span className="sr-only">Label</span>}
                className="form-control pull-right"
                onChange={() => {}}>
                <option value="last">Récents</option>
                <option value="old">Anciens</option>
                <option value="popular">Populaire</option>
              </Input>
            </div>
          )}
        </Panel.Heading>
        {section.isRefetching && <Loader />}
        {!section.isRefetching &&
          (opinionArguments.length === 0 ? null : (
            <ListGroup>
              {opinionArguments.map((item, index) => (
                <ListGroupItem
                  key={index}
                  id={`arg-${index}`}
                  className={`opinion opinion--argument ${
                    item.user && item.user.vip ? ' bg-vip' : ''
                  }`}
                  style={{ backgroundColor: item.user && item.user.vip ? '#F7F7F7' : undefined }}>
                  <OpinionArgumentItem
                    item={item}
                    isProfile={isProfile}
                    argumentType={section.argumentType}
                  />
                </ListGroupItem>
              ))}
              {!section.isLoading && section.paginationEnable && (
                <ListGroupItem style={{ textAlign: 'center' }}>
                  {section.isLoadingMore && <Loader />}
                  {!section.isLoadingMore && (
                    <Button bsStyle="link" onClick={() => {}}>
                      Voir plus
                    </Button>
                  )}
                </ListGroupItem>
              )}
            </ListGroup>
          ))}
      </Panel>
    )}
  </div>
);

const argumentTypes = {
  for: 'FOR',
  against: 'AGAINST',
  simple: 'SIMPLE',
};

storiesOf('OpinionArgumentList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      argumentType: select('Argument type', argumentTypes, 'FOR', 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isRefetching: boolean('Is refetching', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return (
      <OpinionArgumentList
        section={section}
        opinionArguments={opinionArgumentsMock}
        isProfile={false}
      />
    );
  })
  .add('empty', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', false, 'Section'),
      argumentType: select('Argument type', argumentTypes, 'FOR', 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isRefetching: boolean('Is refetching', false, 'Section'),
    };

    return <OpinionArgumentList section={section} opinionArguments={[]} isProfile={false} />;
  })
  .add('with single opinion argument', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', false, 'Section'),
      argumentType: select('Argument type', argumentTypes, 'FOR', 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isRefetching: boolean('Is refetching', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return (
      <OpinionArgumentList
        section={section}
        opinionArguments={[opinionArgumentsMock[0]]}
        isProfile={false}
      />
    );
  })
  .add('in profile', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      argumentType: select('Argument type', argumentTypes, 'FOR', 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isRefetching: boolean('Is refetching', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return (
      <OpinionArgumentList section={section} opinionArguments={opinionArgumentsMock} isProfile />
    );
  });
