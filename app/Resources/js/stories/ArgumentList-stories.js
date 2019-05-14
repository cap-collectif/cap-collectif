// @flow
import * as React from 'react';
import { boolean, select, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem, Panel, DropdownButton, MenuItem } from 'react-bootstrap';
import Input from '../components/Form/Input';
import { UserAvatar } from '../components/User/UserAvatar';
import ListGroup from '../components/Ui/List/ListGroup';
import { argumentsData } from './mocks/arguments';

const argumentTypes = {
  for: 'FOR',
  against: 'AGAINST',
  simple: 'SIMPLE',
};

storiesOf('ArgumentList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const sectionPaginationEnable = boolean('Pagination enabled', true, 'Section');
    const sectionArgumentType = select('Argument type', argumentTypes, 'FOR', 'Section');
    return (
      <div id={`opinion__arguments--${sectionArgumentType}`} className="block--tablet">
        <Panel className="panel--white panel-custom">
          <Panel.Heading>
            <Panel.Title componentClass="h4" className="opinion__header__title d-flex">
              <span>{`30 arguments {${sectionArgumentType}}`}</span>
            </Panel.Title>
            <div className="panel-heading__actions">
              <Input
                type="select"
                id={`filter-arguments-${sectionArgumentType}`}
                label={<span className="sr-only">Label</span>}
                className="form-control pull-right"
                onChange={() => {}}>
                <option value="last">Récents</option>
                <option value="old">Anciens</option>
                <option value="popular">Populaire</option>
              </Input>
            </div>
          </Panel.Heading>
          <ListGroup>
            {argumentsData.map((item, index) => (
              <ListGroupItem
                key={index}
                className={`opinion opinion--argument ${
                  item.user && item.user.vip ? ' bg-vip' : ''
                }`}>
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
                          <p className="excerpt opinion__date">
                            {item.createdAt || item.publishedAt}
                          </p>
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
                      {item.body}
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
                        <span className="opinion__votes-nb">{item.votes.totalCount}</span>
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
