// @flow
import moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import UserAvatarList from '../../User/UserAvatarList';
import ProjectHeaderAuthorsModal from './ProjectHeaderAuthorsModal';
import type { ProjectHeaderAuthors_project } from '~relay/ProjectHeaderAuthors_project.graphql';

type Props = {|
  project: ProjectHeaderAuthors_project,
|};

type State = {|
  showAuthorsModal: boolean,
|};

const Container = styled.div.attrs({})`
  display: flex !important;
`;

const AuthorsButton = styled.button.attrs({})`
  outline: none;
  border: none;
  background: none;
  text-align: left;
`;

const AuthorsContainer = styled.div.attrs({})`
  display: flex !important;
  flex-direction: column;
`;

const getAuthorCredits = (authors: $ReadOnlyArray<Object>) => {
  if (!authors || authors.length <= 0) {
    return '';
  }

  if (authors.length > 2) {
    return (
      <FormattedMessage
        id="project-authors"
        values={{
          authorName: authors[0].username,
          number: authors.length - 1,
        }}
      />
    );
  }

  if (authors.length === 2) {
    return (
      <span>
        {authors[0].username} <FormattedMessage id="event.and" /> {authors[1].username}
      </span>
    );
  }

  return <span>{authors[0].username}</span>;
};

export class ProjectHeaderAuthors extends React.Component<Props, State> {
  state = {
    showAuthorsModal: false,
  };

  closeAuthorsModal = () => {
    this.setState({ showAuthorsModal: false });
  };

  openAuthorsModal = () => {
    this.setState({ showAuthorsModal: true });
  };

  handleClickModal = () => {
    this.setState({ showAuthorsModal: !this.state.showAuthorsModal });
  };

  render() {
    const { project } = this.props;
    const { showAuthorsModal } = this.state;

    return (
      <Container id="project-header">
        {/* $FlowFixMe $refType */}
        <ProjectHeaderAuthorsModal
          users={project.authors}
          onClose={this.closeAuthorsModal}
          show={showAuthorsModal}
        />
        <div>
          {/* $FlowFixMe $refType */}
          <UserAvatarList
            users={project && project.authors ? project.authors : []}
            onClick={this.handleClickModal}
            max={3}
          />
        </div>
        <AuthorsContainer>
          <AuthorsButton
            id="authors-credit"
            className="ml-5 p-0 font-weight-bold"
            onClick={this.handleClickModal}>
            {getAuthorCredits(project.authors)}
          </AuthorsButton>
          <span className="ml-5">
            <FormattedDate
              value={moment(project.publishedAt).toDate()}
              minute="numeric"
              hour="numeric"
              day="numeric"
              month="long"
              year="numeric"
            />
          </span>
        </AuthorsContainer>
      </Container>
    );
  }
}

export default createFragmentContainer(ProjectHeaderAuthors, {
  project: graphql`
    fragment ProjectHeaderAuthors_project on Project {
      id
      publishedAt
      authors {
        username
        ...UserAvatarList_users
        ...ProjectHeaderAuthorsModal_users
      }
    }
  `,
});
