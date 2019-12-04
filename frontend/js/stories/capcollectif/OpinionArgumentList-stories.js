// @flow
import * as React from 'react';
import { boolean, select, text } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem, Panel, Label, OverlayTrigger, Popover } from 'react-bootstrap';
import Input from '../../components/Form/Input';
import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';
import Media from '../../components/Ui/Medias/Media/Media';
import ListGroup from '../../components/Ui/List/ListGroup';
import Loader from '../../components/Ui/FeedbacksIndicators/Loader';
import { opinionArguments as opinionArgumentsMock } from '../mocks/opinionArguments';
import ShareButton from '../../components/Ui/Button/ShareButton';
import ShareButtonAction from '../../components/Ui/Button/ShareButtonAction';

/* eslint-disable react/prop-types */
const OpinionArgumentItem = ({ item, argumentType, isProfile, typeLabel }) => (
  <div className="w-100">
    {isProfile && item.related && (
      <p>
        {'Lié à la proposition : '}
        <a href={item.related.url}>{item.related.title}</a>
      </p>
    )}
    <Media overflow>
      <Media.Left>
        <UserAvatarDeprecated user={item.user} />
      </Media.Left>
      <Media.Body className="opinion__body">
        <div className="opinion__data">
          <div className="opinion__user">
            {item.user && (
              <a href="https://ui.cap-collectif.com" className="excerpt_dark">
                {item.user.username}
              </a>
            )}
            {!item.user && <span>Utilisateur supprimé</span>}
            <span className="excerpt small">
              {' • '}
              {item.createdAt || item.publishedAt}
            </span>
            {!item.published && (
              <React.Fragment>
                {' '}
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Popover
                      title={
                        <strong className="excerpt_dark">Compte en attente de confirmation</strong>
                      }>
                      <p>
                        {
                          'Votre opinion n’a pas été publié, car votre compte a été confirmé après la date de fin de l’étape.'
                        }
                      </p>
                    </Popover>
                  }>
                  <Label bsStyle="danger" bsSize="xs">
                    <i className="cap cap-delete-2" /> Non comptabilisé
                  </Label>
                </OverlayTrigger>
              </React.Fragment>
            )}
            {typeLabel && (
              <React.Fragment>
                {' '}
                <Label>{typeLabel}</Label>
              </React.Fragment>
            )}
            {isProfile && (
              <React.Fragment>
                {' '}
                <Label bsStyle={argumentType === 'FOR' ? 'success' : 'danger'} bsSize="xs">
                  {argumentType === 'FOR' ? 'pour' : 'contre'}
                </Label>
              </React.Fragment>
            )}
          </div>
        </div>
        {item.trashedStatus === 'INVISIBLE' ? (
          <div className="opinion__text">[Contenu masqué]</div>
        ) : (
          <p className="opinion__text">{item.body}</p>
        )}
        <div className="small">
          <span>
            <form className="opinion__votes-button">
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
            </form>
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
                type="submit"
                className="argument__btn--edit btn btn-xs btn-dark-gray btn--outline"
                onClick={() => {}}>
                <i className="cap cap-pencil-1" /> Modifier
              </button>{' '}
            </React.Fragment>
          )}
          {item.user && item.user.isViewer && (
            <React.Fragment>
              <button
                type="submit"
                className="argument__btn--delete btn btn-xs btn-danger btn--outline"
                onClick={() => {}}>
                <i className="cap cap-bin-2" /> Supprimer
              </button>{' '}
            </React.Fragment>
          )}
          <ShareButton id={`share-button-${item.id}`} bsSize="xs" outline grey>
            <ShareButtonAction action="mail" />
            <ShareButtonAction action="facebook" />
            <ShareButtonAction action="twitter" />
            <ShareButtonAction action="linkedin" />
            <ShareButtonAction action="link" />
          </ShareButton>
        </div>
      </Media.Body>
    </Media>
  </div>
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
                <option value="last">Les plus récents</option>
                <option value="old">Les plus anciens</option>
                <option value="popular">Les plus populaires</option>
              </Input>
            </div>
          )}
        </Panel.Heading>
        {section.isRefetching && <Loader />}
        {!section.isRefetching &&
          (opinionArguments.length === 0 ? (
            <Panel.Body className="text-center excerpt">
              <i className="cap-32 cap-baloon-1" />
              <br />
              Aucun argument {section.argumentType} proposé
            </Panel.Body>
          ) : (
            <ListGroup>
              {opinionArguments.map((item, index) => (
                <ListGroupItem
                  key={index}
                  id={`arg-${index}`}
                  className={`list-group-item__opinion opinion ${
                    item.user && item.user.vip ? ' bg-vip' : ''
                  }`}
                  style={{ backgroundColor: item.user && item.user.vip ? '#F7F7F7' : undefined }}>
                  <OpinionArgumentItem
                    item={item}
                    isProfile={isProfile}
                    argumentType={section.argumentType}
                    typeLabel={section.typeLabel}
                  />
                </ListGroupItem>
              ))}
              {!section.isLoading && section.paginationEnable && (
                <ListGroupItem>
                  {section.isLoadingMore && <Loader size={28} inline />}
                  {!section.isLoadingMore && (
                    <Button bsStyle="link" block onClick={() => {}}>
                      {"Voir plus d'arguments"}
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

storiesOf('Cap Collectif|OpinionArgumentList', module)
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
  })
  .add('in trash', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      argumentType: select('Argument type', argumentTypes, 'FOR', 'Section'),
      typeLabel: text('Type label', 'Dans la corbeille', 'Section'),
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
  });
