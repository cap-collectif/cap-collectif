// @flow
import * as React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Row, Col, Label } from 'react-bootstrap';

import Media from '../../components/Ui/Medias/Media/Media';
import Card from '../../components/Ui/Card/Card';
import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';
import UserLink from '../../components/User/UserLink';

import { followers as followersMock } from '../mocks/users';

/* eslint-disable react/prop-types */
const FollowerItem = ({ user }) => (
  <Card>
    <Card.Body>
      <Media>
        <Media.Left>
          {/* $FlowFixMe */}
          <UserAvatarDeprecated user={user} />
        </Media.Left>
        <Media.Body>
          {user ? (
            <div>
              <UserLink className="excerpt" user={user} />
              {!user.isEmailConfirmed && (
                <span>
                  {' '}
                  <Label bsStyle="danger">
                    <i className="cap cap-delete-2" /> Non vérifié
                  </Label>
                </span>
              )}
            </div>
          ) : (
            <span className="excerpt">Anonyme</span>
          )}
          <p className="excerpt small">
            {user ? <span>{`${user.contributionsCount} contributions`}</span> : null}
          </p>
        </Media.Body>
      </Media>
    </Card.Body>
  </Card>
);

const FollowersList = ({ withHeader, hasMore, isLoading, followers }) => (
  <div>
    {withHeader && (
      <div className="box-header">
        <h3 className="box-title mb-20">{followers.length} abonnés</h3>
      </div>
    )}

    {followers.length !== 0 ? (
      <Row>
        {followers.map((follower, key) => (
          <Col xs={12} sm={6} md={4} lg={3} className="proposal__follower">
            <FollowerItem key={key} user={follower} />
          </Col>
        ))}
      </Row>
    ) : (
      <div className="well well-lg text-center">
        <i className="cap-32 cap-contacts-1 " />
        <br />
        Aucun abonné
      </div>
    )}

    {hasMore && (
      <div className="text-center">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {}}
          className="text-center btn btn-secondary">
          {isLoading ? 'Chargement...' : 'Voir plus d’abonnés'}
        </button>
      </div>
    )}
  </div>
);

storiesOf('Cap Collectif|FollowersList', module)
  .add('default case', () => {
    const section = {
      withHeader: boolean('with header', true, 'Section'),
      hasMore: boolean('has more', true, 'Section'),
      isLoading: boolean('is loading more', false, 'Section'),
    };

    return <FollowersList followers={followersMock} {...section} />;
  })
  .add('with single follower', () => {
    const section = {
      withHeader: boolean('With header', true, 'Section'),
      hasMore: boolean('has more', false, 'Section'),
      isLoading: boolean('is loading more', false, 'Section'),
    };

    return <FollowersList followers={[followersMock[0]]} {...section} />;
  })
  .add('empty case', () => {
    const section = {
      withHeader: boolean('With header', true, 'Section'),
      hasMore: false,
      isLoading: false,
    };

    return <FollowersList followers={[]} {...section} />;
  });
