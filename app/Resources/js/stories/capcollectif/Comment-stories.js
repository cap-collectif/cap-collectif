// @flow
import * as React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { FormattedMessage } from 'react-intl';
import { Tooltip, OverlayTrigger, Label, Popover, Button } from 'react-bootstrap';

import Media from '../../components/Ui/Medias/Media/Media';
import PinnedLabel from '../../components/Utils/PinnedLabel';
import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';

import { comment as commentMock, comments } from '../mocks/comments';

const getCommentBackground = ({ isAnswer, useBodyColor }) => {
  if (isAnswer && useBodyColor) return '#f6f6f6';
  if (isAnswer && !useBodyColor) return '#ffffff';
  if (!isAnswer && useBodyColor) return '#ffffff';

  return '#f6f6f6';
};

const CommentContainer = styled.div`
  background-color: ${props => getCommentBackground(props)};
  padding: 10px;
  border-radius: 10px;
  border: ${props => (props.isHighlighted ? '1px solid #0388cc' : undefined)};
`;

const CommentAnswersContainer = styled.ul`
  width: 100%;
  margin: 20px 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: 10px;
  }
`;

type Props = {|
  +item: Object,
  +answers?: Array<Object>,
  +useBodyColor: boolean,
  +isAnswer?: boolean,
  +disabledButtons?: boolean,
|};

const Comment = ({ item, answers, useBodyColor, isAnswer, disabledButtons }: Props) => (
  <CommentContainer
    isAnswer={isAnswer}
    useBodyColor={useBodyColor}
    isHighlighted={item.highlighted}>
    <Media className="opinion">
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
            <span className="excerpt small" title={item.createdAt}>
              {' • '} {item.createdAt}
            </span>
            {item.updatedAt && (
              <span className="excerpt small">
                {' • '}
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip placement="top" id="tooltip-top">
                      Modifiée le 15/03/2015
                    </Tooltip>
                  }>
                  <span>Modifiée</span>
                </OverlayTrigger>
              </span>
            )}
            <PinnedLabel show={item.pinned || false} type="comment" />
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
          </div>
        </div>
        {item.trashedStatus === 'INVISIBLE' ? (
          <div className="opinion__text">[Contenu masqué]</div>
        ) : (
          <p className="opinion__text">{item.body}</p>
        )}
        {item.body && item.body.length > 400 && (
          <button type="button" className="btn-link" onClick={() => {}}>
            {<FormattedMessage id="global.read_more" />}
          </button>
        )}
        {item.trashed && (
          <div className="mt-5">
            <span>{item.trashedReason}</span>
          </div>
        )}
        {!disabledButtons && (
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
                    <span>
                      <FormattedMessage id="global.cancel" />
                    </span>
                  ) : (
                    <span>
                      <i className="cap cap-hand-like-2" /> <FormattedMessage id="vote.ok" />
                    </span>
                  )}
                </Button>
              </form>
              <span className="opinion__votes-nb">{item.votes.totalCount}</span>
            </span>
            {!isAnswer && (
              <React.Fragment>
                <Button bsSize="xsmall" onClick={() => {}} className="btn-dark-gray btn--outline">
                  <i className="cap-reply-mail-2" /> <FormattedMessage id="global.answer" />
                </Button>{' '}
              </React.Fragment>
            )}
            {item.user && !item.user.isViewer && (
              <React.Fragment>
                <span>
                  <Button
                    className="btn--outline btn-dark-gray"
                    active={item.reported}
                    disabled={item.reported}
                    bsSize="xs"
                    onClick={() => {}}>
                    <i className="cap cap-flag-1" />{' '}
                    {item.reported ? (
                      <FormattedMessage id="comment.report.reported" />
                    ) : (
                      <FormattedMessage id="comment.report.submit" />
                    )}
                  </Button>
                </span>{' '}
              </React.Fragment>
            )}
            {item.user && item.user.isViewer && (
              <React.Fragment>
                <button
                  type="button"
                  className="btn btn-xs btn-dark-gray btn--outline"
                  onClick={() => {}}>
                  <i className="cap cap-pencil-1" /> <FormattedMessage id="global.edit" />
                </button>{' '}
              </React.Fragment>
            )}
            {item.user && item.user.isViewer && (
              <React.Fragment>
                <button
                  type="button"
                  className="btn btn-xs btn-danger btn--outline"
                  onClick={() => {}}>
                  <i className="cap cap-bin-2" /> <FormattedMessage id="global.delete" />
                </button>{' '}
              </React.Fragment>
            )}
          </div>
        )}
        <div>
          {answers && (
            <CommentAnswersContainer id="comments-answers">
              {answers.map((answer, index) => (
                <li key={index}>
                  <Comment isAnswer useBodyColor={useBodyColor} item={answer} />
                </li>
              ))}
            </CommentAnswersContainer>
          )}
        </div>
      </Media.Body>
    </Media>
  </CommentContainer>
);

Comment.defaultProps = {
  useBodyColor: true,
};

storiesOf('Cap Collectif|Comment', module)
  .add('default case', () => {
    return <Comment item={commentMock} />;
  })
  .add('with truncated message', () => {
    return (
      <Comment
        item={{
          ...commentMock,
          body:
            'Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical. Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical. Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical.',
        }}
      />
    );
  })
  .add('is highlighted', () => {
    return <Comment item={{ ...commentMock, highlighted: true }} />;
  })
  .add('without actions', () => {
    return <Comment item={commentMock} disabledButtons />;
  })
  .add('has answers', () => {
    return <Comment item={commentMock} answers={comments} />;
  })
  .add('with inverted background', () => {
    return (
      <div style={{ background: '#333333', padding: '30px 60px' }}>
        <Comment item={commentMock} useBodyColor answers={comments} />
      </div>
    );
  });
