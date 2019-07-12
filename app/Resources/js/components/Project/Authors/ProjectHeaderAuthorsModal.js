// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Modal, ListGroupItem, ListGroup } from 'react-bootstrap';

import type { State, FeatureToggles } from '../../../types';
import CloseButton from '../../Form/CloseButton';
import UserAvatar from '../../User/UserAvatar';

import type { ProjectHeaderAuthorsModal_users } from '~relay/ProjectHeaderAuthorsModal_users.graphql';

type Props = {|
  show: boolean,
  onClose: () => void,
  features: FeatureToggles,
  users: ProjectHeaderAuthorsModal_users,
|};

const ProjectAuthorItem = styled(ListGroupItem)`
  border-left: none;
  border-right: none;
`;

const ProjectAuthorList = styled(ListGroup)`
  ${ProjectAuthorItem}:first-of-type {
    border-top: none;
  }
  ${ProjectAuthorItem}:last-of-type {
    border-bottom: none;
  }
`;

const renderAuthorItemUserName = (user, profileFeature) =>
  profileFeature ? (
    <a href={user.url}>{user.username}</a>
  ) : (
    <span className="font-weight-bold">{user.username}</span>
  );

const renderAuthorsList = (users: ProjectHeaderAuthorsModal_users, features: FeatureToggles) =>
  users.map(user => (
    <ProjectAuthorItem>
      <div className="d-flex">
        <UserAvatar user={user} features={features} />
        <div className="d-flex fd-column">
          {renderAuthorItemUserName(user, !!features.profiles)}{' '}
          <span className="excerpt">{user.userType ? user.userType.name : ''}</span>
        </div>
      </div>
    </ProjectAuthorItem>
  ));

export const ProjectHeaderAuthorsModal = ({ show, onClose, users, features }: Props) => (
  <Modal id="show-authors-modal" animation={false} onHide={onClose} show={show}>
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-lg" className="font-weight-bold">
        <FormattedMessage
          id="number-of-authors"
          values={{
            num: users ? users.length : 0,
          }}
        />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ProjectAuthorList className="mb-0">{renderAuthorsList(users, features)}</ProjectAuthorList>
    </Modal.Body>
    <Modal.Footer>
      <CloseButton onClose={onClose} />
    </Modal.Footer>
  </Modal>
);

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(ProjectHeaderAuthorsModal), {
  users: graphql`
    fragment ProjectHeaderAuthorsModal_users on User @relay(plural: true) {
      id
      url
      username
      userType {
        name
      }
      ...UserAvatar_user
    }
  `,
});
