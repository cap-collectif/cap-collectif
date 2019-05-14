// @flow
import * as React from 'react';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem, Label, Media, Panel, Row, Col } from 'react-bootstrap';
import { UserAvatar } from '../components/User/UserAvatar';
import ListGroup from '../components/Ui/List/ListGroup';
import Card from '../components/Ui/Card/Card';
import { opinionSources } from './mocks/opinionSources';

storiesOf('OpinionSourceList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const sectionAddSourceEnable = boolean('Add source enabled', true, 'Section');
    const sectionPaginationEnable = boolean('Pagination enabled', true, 'Section');
    return (
      <div>
        <Panel>
          <Panel.Heading>
            <Row>
              <Col xs={12} sm={6} md={6}>
                <Button
                  id="source-form__add"
                  disabled={!sectionAddSourceEnable}
                  bsStyle="primary"
                  onClick={() => {}}>
                  <i className="cap cap-add-1" /> Proposer une source
                </Button>
              </Col>
              <Col xs={12} sm={6} md={6}>
                <select className="form-control pull-right" onBlur={() => {}}>
                  <option value="last">Récents</option>
                  <option value="old">Anciens</option>
                  <option value="popular">Populaire</option>
                </select>
              </Col>
            </Row>
          </Panel.Heading>
          <ListGroup id="sources-list">
            {opinionSources.map((item, index) => (
              <ListGroupItem
                key={index}
                id={`source-${index}`}
                className={`list-group-item__opinion ${
                  item.user && item.user.vip ? ' bg-vip' : ''
                }`}>
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
                    <Card.Title tagName="h3" firstElement={false}>
                      {item.category && (
                        <React.Fragment>
                          <Label bsStyle="primary">{item.category}</Label>{' '}
                        </React.Fragment>
                      )}
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
                          {item.votes.totalCount}
                        </Button>
                      </span>
                    </div>
                  </Media.Body>
                </Media>
              </ListGroupItem>
            ))}
            {sectionPaginationEnable && (
              <ListGroupItem style={{ textAlign: 'center' }}>
                <Button bsStyle="link" onClick={() => {}}>
                  Voir plus
                </Button>
              </ListGroupItem>
            )}
          </ListGroup>
        </Panel>
      </div>
    );
  });
