// @flow
import * as React from 'react';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem, Row, Col, Panel } from 'react-bootstrap';
import { UserAvatar } from '../components/User/UserAvatar';
import InlineList from '../components/Ui/List/InlineList';
import ListGroup from '../components/Ui/List/ListGroup';
import Media from '../components/Ui/Medias/Media/Media';
import Card from '../components/Ui/Card/Card';
import PieChart from '../components/Ui/Chart/PieChart';
import { opinionVersions } from './mocks/opinionVersions';

storiesOf('OpinionVersionList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const sectionPaginationEnable = boolean('Pagination enabled', true, 'Section');

    return (
      <Panel>
        <Panel.Heading>
          <Row>
            <Col xs={12} sm={6} md={6}>
              <Button bsStyle="primary" onClick={() => {}}>
                <i className="cap cap-add-1" /> Proposer un amendement
              </Button>
            </Col>
            <Col xs={12} sm={6} md={6} className="block--first-mobile">
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
            </Col>
          </Row>
        </Panel.Heading>
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
            </ListGroupItem>
          ))}
          {sectionPaginationEnable && (
            <ListGroupItem style={{ textAlign: 'center' }}>
              <Button id="OpinionListPaginated-loadmore" bsStyle="link" onClick={() => {}}>
                Voir toutes les amendements
              </Button>
            </ListGroupItem>
          )}
        </ListGroup>
      </Panel>
    );
  });
