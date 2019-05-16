// @flow
import * as React from 'react';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import {
  Button,
  ListGroupItem,
  Row,
  Col,
  Panel,
  Tooltip,
  OverlayTrigger,
  Popover,
  Label,
} from 'react-bootstrap';
import { UserAvatar } from '../components/User/UserAvatar';
import InlineList from '../components/Ui/List/InlineList';
import ListGroup from '../components/Ui/List/ListGroup';
import Media from '../components/Ui/Medias/Media/Media';
import Card from '../components/Ui/Card/Card';
import PieChart from '../components/Ui/Chart/PieChart';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';
import PinnedLabel from '../components/Utils/PinnedLabel';
import { opinionVersions as opinionVersionsMock } from './mocks/opinionVersions';

const OpinionVersion = ({ item, typeLabel }) => (
  <React.Fragment>
    <Media>
      <Media.Left>
        <UserAvatar user={item.user} />
      </Media.Left>
      <Media.Body>
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
            <span className="excerpt">
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
              <i className="cap cap-trophy" /> {item.ranking}
            </span>
          )}
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
        </div>
        <Card.Title tagName="div" firstElement={false}>
          {typeLabel && (
            <React.Fragment>
              <Label>{typeLabel}</Label>{' '}
            </React.Fragment>
          )}
          <a href={item.url}>{item.title}</a>
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
  </React.Fragment>
);

const OpinionVersionList = ({ section, opinionVersions }) => (
  <Panel>
    <Panel.Heading>
      <Row>
        <Col xs={12} sm={6} md={6}>
          <Button bsStyle="primary" onClick={() => {}}>
            <i className="cap cap-add-1" /> Proposer un amendement
          </Button>
        </Col>
        <Col xs={12} sm={6} md={6} className="block--first-mobile">
          {opinionVersions.length > 1 && (
            <form className="form-inline">
              <label htmlFor="filter-opinion-version" className="control-label sr-only">
                Trier
              </label>
              <select
                id="filter-opinion-version"
                className="form-control pull-right"
                defaultChecked="last"
                aria-label="Trier"
                onChange={() => {}}
                onBlur={() => {}}>
                <option value="positions">Tri ordonné puis aléatoire</option>
                <option value="random">Aléatoire</option>
                <option value="last">Les plus récents</option>
                <option value="old">Les plus anciens</option>
                <option value="favorable">Les plus favorables</option>
                <option value="votes">Les plus votés</option>
                <option value="comments">Les plus commentés</option>
              </select>
            </form>
          )}
        </Col>
      </Row>
    </Panel.Heading>
    {section.isLoading && <Loader />}
    {!section.isLoading &&
      (opinionVersions.length === 0 ? (
        <Panel.Body className="text-center">
          <i className="cap-32 cap-baloon-1" />
          <br />
          Aucun amendement proposé
        </Panel.Body>
      ) : (
        <ListGroup>
          {opinionVersions.map((item, index) => (
            <ListGroupItem
              key={index}
              className={`list-group-item__opinion text-left has-chart${
                item.user && item.user.vip ? ' bg-vip' : ''
              }`}
              style={{ backgroundColor: item.user && item.user.vip ? '#F7F7F7' : undefined }}>
              <OpinionVersion item={item} typeLabel={section.typeLabel || null} />
            </ListGroupItem>
          ))}
          {!section.isLoading && section.paginationEnable && (
            <ListGroupItem className="text-center">
              {section.isLoadingMore && <Loader />}
              {!section.isLoadingMore && (
                <Button id="OpinionListPaginated-loadmore" bsStyle="link" onClick={() => {}}>
                  Voir plus
                </Button>
              )}
            </ListGroupItem>
          )}
        </ListGroup>
      ))}
  </Panel>
);

storiesOf('OpinionVersionList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return <OpinionVersionList section={section} opinionVersions={opinionVersionsMock} />;
  })
  .add('with single opinion version', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', false, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
    };

    return <OpinionVersionList section={section} opinionVersions={[opinionVersionsMock[0]]} />;
  })
  .add('empty', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', false, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
    };

    return <OpinionVersionList section={section} opinionVersions={[]} />;
  })
  .add('in trash', () => {
    const section = {
      paginationEnable: boolean('Pagination enabled', true, 'Section'),
      isLoading: boolean('Is loading', false, 'Section'),
      isLoadingMore: boolean('Is loading more', false, 'Section'),
      typeLabel: text('Type label', 'Dans la corbeille', 'Section'),
    };

    return <OpinionVersionList section={section} opinionVersions={opinionVersionsMock} />;
  });
