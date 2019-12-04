// @flow
import * as React from 'react';
import { select, boolean, text } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import {
  ListGroupItem,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Popover,
  Label,
  Row,
  Col,
} from 'react-bootstrap';
import ShareButton from '../../components/Ui/Button/ShareButton';
import ShareButtonAction from '../../components/Ui/Button/ShareButtonAction';

import Card from '../../components/Ui/Card/Card';
import UserLink from '../../components/User/UserLink';
import PieChart from '../../components/Ui/Chart/PieChart';
import Media from '../../components/Ui/Medias/Media/Media';
import ListGroup from '../../components/Ui/List/ListGroup';
import InlineList from '../../components/Ui/List/InlineList';
import PinnedLabel from '../../components/Utils/PinnedLabel';
import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';

import { author as authorMock } from '../mocks/users';
import { opinion as opinionMock } from '../mocks/opinions';
import UserAvatarList from '../../components/Ui/List/UserAvatarList';

const headerOption = {
  Gray: 'gray',
  White: 'white',
  Green: 'green',
  BlueDark: 'bluedark',
  Blue: 'blue',
  Orange: 'orange',
  Red: 'red',
  Default: 'default',
};

const voteWidgetTypes = {
  disabled: 0,
  simple: 1,
  both: 2,
};

/* eslint-disable react/prop-types */
const OpinionItem = ({ item, typeLabel }) => (
  <React.Fragment>
    <Media>
      <Media.Left>
        <UserAvatarDeprecated user={item.user} />
      </Media.Left>
      <Media.Body className="opinion__body">
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
          <PinnedLabel show={item.pinned || false} type="opinion" />
          {item.ranking && (
            <span className="text-label text-label--green ml-10">
              <i className="cap cap-trophy" />
              {item.ranking}
            </span>
          )}
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
        </div>
        {item.trashedStatus === 'INVISIBLE' ? (
          <div>[Contenu masqué]</div>
        ) : (
          <Card.Title tagName="div" firstElement={false}>
            <a href={item.url}>{item.title}</a>
          </Card.Title>
        )}
        <InlineList className="excerpt small">
          <li>{`${item.votes.totalCount} votes`}</li>
          <li>{`${item.versions.totalCount} amendements`}</li>
          <li>{`${item.arguments.totalCount} arguments`}</li>
          <li>{`${item.sources.totalCount} source`}</li>
        </InlineList>
      </Media.Body>
    </Media>
    <div className="hidden-xs">
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
    </div>
  </React.Fragment>
);

const OpinionBox = ({ section, opinion }) => (
  /** Blah blah blah */
  <div id="OpinionBox" className="block block--bordered opinion__details">
    <div className={`opinion opinion--${section.bgColor} opinion--current`}>
      <div className="opinion__header opinion__header--centered" style={{ height: 'auto' }}>
        <a className="pull-left btn btn-default opinion__header__back" href={section.url}>
          <i className="cap cap-arrow-1-1" />
          <span className="hidden-xs hidden-sm"> Retour</span>
        </a>
        <div className="opinion__header__title" />
        <h2 className="h4 opinion__header__title">
          {section.title}
          <p className="small excerpt" style={{ marginTop: '5px' }}>
            {section.subtitle}
          </p>
        </h2>
      </div>
      <ListGroup className="mb-0">
        <ListGroupItem className="list-group-item__opinion no-border">
          <div className="left-block">
            {/* $FlowFixMe */}
            <OpinionItem item={opinion} />
          </div>
        </ListGroupItem>
      </ListGroup>
    </div>
    {/** OpinionAppendices.js */}
    {opinion && opinion.appendices.length > 0 && (
      <div className="opinion__description">
        {opinion.appendices.map((appendix, index) => {
          if (appendix && appendix.body) {
            return (
              <div className="opinion__appendix" key={index}>
                <div className="opinion__appendix__title">{appendix.title}</div>
                <div className="opinion__appendix__content">
                  <p>{appendix.body}</p>
                </div>
              </div>
            );
          }
        })}
      </div>
    )}
    <div className="opinion__description">
      {/** OpinionBody.js */}
      <p>{opinion.body}</p>
      {/** Votes/OpinionVotesBox.js */}
      {section.voteWidgetType !== 0 && (
        <div className="opinion__votes__box">
          {section && section.votesHelpText && (
            <p className="h4" style={{ marginBottom: '0' }}>
              {section.votesHelpText}
            </p>
          )}
          <Row>
            <Col sm={10} md={8} style={{ paddingTop: '15px' }}>
              {/** Votes/OpinionVotesButtons.js */}
              <ButtonToolbar className="opinion__votes__buttons">
                <Button
                  bsStyle="success"
                  className="btn--outline"
                  onClick={() => {}}
                  active={false}
                  aria-label="Souhaitez-vous déclarer être d'accord avec cette proposition ?"
                  disabled={section.voteDisabled}>
                  <i className="cap cap-hand-like-2-1" /> {"D'accord"}
                </Button>
                <Button
                  style={{ marginLeft: 5 }}
                  bsStyle="warning"
                  className="btn--outline"
                  onClick={() => {}}
                  active={false}
                  aria-label="Souhaitez-vous déclarer être mitigé avec cette proposition ?"
                  disabled={section.voteDisabled}>
                  <i className="cap cap-hand-like-2-1 icon-rotate" /> {'Mitigé'}
                </Button>
                <Button
                  style={{ marginLeft: 5 }}
                  bsStyle="danger"
                  className="btn--outline"
                  onClick={() => {}}
                  active={false}
                  aria-label="Souhaitez-vous déclarer ne pas être d'accord avec cette proposition ?"
                  disabled={section.voteDisabled}>
                  <i className="cap cap-hand-unlike-2-1" /> {"Pas d'accord"}
                </Button>
              </ButtonToolbar>
              {/** Votes/OpinionVotesBar.js */}
              <div>
                {/** Votes/OpinionUserVotes.js */}
                {opinion.previewVotes.length > 0 && (
                  <div style={{ paddingTop: '20px' }}>
                    <UserAvatarList>
                      {opinion.previewVotes.map(user => (
                        <img
                          src={user.media.url}
                          alt={user.username}
                          className="img-circle object-cover user-avatar mr-10"
                          style={{ width: 45, height: 45 }}
                        />
                      ))}
                    </UserAvatarList>
                  </div>
                )}
              </div>
            </Col>
            {opinion.votes.totalCount > 0 && section.voteWidgetType === 2 && (
              <Col sm={2} md={4}>
                <div className="pull-right hidden-xs">
                  <PieChart
                    data={[
                      { name: "D'accord", value: opinion.votesOk.totalCount },
                      { name: 'Mitigé', value: opinion.votesMitige.totalCount },
                      { name: "Pas d'accord", value: opinion.votesNok.totalCount },
                    ]}
                    colors={['#5cb85c', '#f0ad4e', '#d9534f']}
                  />
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}
      <div
        className="opinion__buttons"
        style={{ marginTop: '15px', marginBottom: 0 }}
        aria-label="Formulaire de vote">
        {/** OpinionButtons.js */}
        <ButtonToolbar>
          {/** OpinionDelete.js */}
          <div>
            <Button
              id="opinion-delete"
              className="pull-right btn--outline btn-danger"
              onClick={() => {}}
              style={{ marginLeft: '5px' }}>
              <i className="cap cap-bin-2" /> {'Supprimer'}
            </Button>
          </div>
          {/** OpinionEditButton.js */}
          <span>
            <Button
              id="opinion-edit-btn"
              className="opinion__action--edit pull-right btn--outline"
              onClick={() => {}}>
              <i className="cap cap-pencil-1" /> {'Modifier'}
            </Button>
          </span>
          {/** Follow/OpinionFollowButton.js */}
          {opinion.project && opinion.project.opinionCanBeFollowed && (
            <Button
              className="btn btn--default opinion__button__follow"
              onClick={() => {}}
              id={`opinion-follow-btn-${opinion.id}`}>
              <i className="cap cap-rss" /> {"S'abonner"}
            </Button>
          )}
          {/** OpinionReportButton.js */}
          <span>
            <Button
              id={`report-opinion-${opinion.id}-button`}
              active={false}
              disabled={false}
              onClick={() => {}}
              style={{ marginLeft: 5 }}
              className="opinion__action--report btn btn--default">
              <i className="cap cap-flag-1" /> {'Signaler'}
            </Button>
          </span>
          {/** Utils/ShareButtonDropdown.js */}
          {opinion.title && opinion.url && (
            <ShareButton id="shareButton" margin="ml-5">
              <ShareButtonAction action="mail" />
              <ShareButtonAction action="facebook" />
              <ShareButtonAction action="twitter" />
              <ShareButtonAction action="linkedin" />
              <ShareButtonAction action="link" />
            </ShareButton>
          )}
        </ButtonToolbar>
      </div>
    </div>
    {/** OpinionAnswer.js */}
    {opinion.answer && (
      <div id="answer" className="opinion__answer bg-vip">
        {opinion.answer.title && (
          <p className="h4" style={{ marginTop: '0' }}>
            {opinion.answer.title}
          </p>
        )}
        {/** Answer/AnswerBody.js */}
        <div>
          {opinion.answer.author ? (
            <div className="media media--user-thumbnail" style={{ marginBottom: '10px' }}>
              <UserAvatarDeprecated className="pull-left" user={opinion.answer.author} />
              <div className="media-body">
                <p className="media-heading media--macro__user" style={{ marginBottom: '0' }}>
                  <UserLink user={opinion.answer.author} />
                </p>
                <span className="excerpt">15 mai 2018</span>
              </div>
            </div>
          ) : null}
          <p>{opinion.answer.body}</p>
        </div>
      </div>
    )}
  </div>
);

storiesOf('Cap Collectif|OpinionBox', module)
  .add('default case', () => {
    const section = {
      title: text('Title', 'Proposition', 'Section'),
      subtitle: text('Title', 'Titre de la section', 'Section'),
      url: text('Url', 'https://capco.dev/projects', 'Section'),
      bgColor: select('Header background color', headerOption, 'default', 'Section'),
      voteDisabled: boolean('Disable vote', false, 'Section'),
      voteWidgetType: select('Vote widget type', voteWidgetTypes, 2, 'Section'),
      votesHelpText: text('Votes help text', 'Exemple help text', 'Section'),
    };

    const opinionWithoutVote = {
      ...opinionMock,
      votes: { totalCount: 0 },
      versions: { totalCount: 0 },
      arguments: { totalCount: 0 },
      sources: { totalCount: 0 },
      votesMitige: { totalCount: 0 },
      votesNok: { totalCount: 0 },
      votesOk: { totalCount: 0 },
      previewVotes: [],
    };

    return <OpinionBox section={section} opinion={opinionWithoutVote} />;
  })
  .add('with appendices', () => {
    const section = {
      title: text('Title', 'Proposition', 'Section'),
      subtitle: text('Title', 'Titre de la section', 'Section'),
      url: text('Url', 'https://capco.dev/projects', 'Section'),
      bgColor: select('Header background color', headerOption, 'default', 'Section'),
      voteDisabled: boolean('Disable vote', false, 'Section'),
      voteWidgetType: select('Vote widget type', voteWidgetTypes, 2, 'Section'),
      votesHelpText: text('Votes help text', 'Exemple help text', 'Section'),
    };

    const opinionWithAppendices = {
      ...opinionMock,
      appendices: [
        {
          title: 'Exposé des motifs',
          body:
            'Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical.',
        },
        {
          title: 'Annexes',
          body:
            'Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical.',
        },
      ],
    };

    return <OpinionBox section={section} opinion={opinionWithAppendices} />;
  })
  .add('with votes', () => {
    const section = {
      title: text('Title', 'Proposition', 'Section'),
      subtitle: text('Title', 'Titre de la section', 'Section'),
      url: text('Url', 'https://capco.dev/projects', 'Section'),
      bgColor: select('Header background color', headerOption, 'default', 'Section'),
      voteDisabled: boolean('Disable vote', false, 'Section'),
      voteWidgetType: select('Vote widget type', voteWidgetTypes, 2, 'Section'),
      votesHelpText: text('Votes help text', 'Exemple help text', 'Section'),
    };

    return <OpinionBox section={section} opinion={opinionMock} />;
  })
  .add('with answer', () => {
    const section = {
      title: text('Title', 'Proposition', 'Section'),
      subtitle: text('Title', 'Titre de la section', 'Section'),
      url: text('Url', 'https://capco.dev/projects', 'Section'),
      bgColor: select('Header background color', headerOption, 'default', 'Section'),
      voteDisabled: boolean('Disable vote', false, 'Section'),
      voteWidgetType: select('Vote widget type', voteWidgetTypes, 2, 'Section'),
      votesHelpText: text('Votes help text', 'Exemple help text', 'Section'),
    };

    const opinionWithAnswers = {
      ...opinionMock,
      answer: {
        title: 'Exemple de réponse',
        body:
          'Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical.',
        author: authorMock,
      },
    };

    return <OpinionBox section={section} opinion={opinionWithAnswers} />;
  });
