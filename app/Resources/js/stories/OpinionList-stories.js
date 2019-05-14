// @flow
import * as React from 'react';
import { boolean, select, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, ListGroupItem } from 'react-bootstrap';
import { UserAvatar } from '../components/User/UserAvatar';
import InlineList from '../components/Ui/List/InlineList';
import ListGroup from '../components/Ui/List/ListGroup';
import Media from '../components/Ui/Medias/Media/Media';
import Card from '../components/Ui/Card/Card';
import PieChart from '../components/Ui/Chart/PieChart';

import { opinions } from './mocks/opinions';

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

storiesOf('OpinionList', module)
  .addDecorator(withKnobs)
  .add('default case', () => {
    const sectionContribuable = boolean('Contribuable', true, 'Section');
    const sectionBgColor = select('Header background color', headerOption, 'default', 'Section');
    const sectionPaginationEnable = boolean('Pagination enabled', true, 'Section');

    return (
      <Card id="opinions--test17" className="anchor-offset" style={{ border: 0 }}>
        <Card.Header
          bgColor={sectionBgColor}
          style={{ border: '1px solid #e3e3e3', borderBottom: 0 }}>
          <div className="opinion d-flex align-items-center justify-content-between">
            <span className="excerpt_dark">4 propositions</span>
            {opinions.length > 1 && (
              <form className="form-inline">
                <select
                  defaultChecked="positions"
                  className="form-control"
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
            {sectionContribuable && (
              <Button bsStyle="primary" id="btn-add--" onClick={() => {}} style={{ margin: 0 }}>
                <i className="cap cap-add-1" />{' '}
                <span className="hidden-xs">Nouvelle proposition</span>
              </Button>
            )}
          </div>
        </Card.Header>
        {opinions.length > 0 && (
          <ListGroup style={{ margin: 0 }}>
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
            {sectionPaginationEnable && (
              <ListGroupItem className="text-center">
                <a
                  href="https://ui.cap-collectif.com"
                  style={{ display: 'block', backgroundColor: '#fff' }}>
                  Voir toutes les propositions
                </a>
              </ListGroupItem>
            )}
          </ListGroup>
        )}
      </Card>
    );
  });
