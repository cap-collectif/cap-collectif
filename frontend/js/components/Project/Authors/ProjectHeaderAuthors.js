// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import colors from '../../../utils/colors';
import UserAvatarList from '../../User/UserAvatarList';
import ProjectHeaderAuthorsModal from './ProjectHeaderAuthorsModal';
import type { ProjectHeaderAuthors_project } from '~relay/ProjectHeaderAuthors_project.graphql';

type Props = {|
  project: ProjectHeaderAuthors_project,
|};

type State = {|
  showAuthorsModal: boolean,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({})`
  display: flex;
  align-items: center;
`;

const AuthorsContainer = styled.div.attrs({})`
  display: flex;
  flex-direction: column;
`;

const AuthorsCreditContainer = styled.a.attrs({})`
  color: ${colors.darkText};
  cursor: pointer;
`;

const getAuthorCredits = (authors: $ReadOnlyArray<Object>) => {
  if (!authors || authors.length <= 0) {
    return '';
  }

  if (authors.length > 2) {
    return (
      <span>
        <FormattedMessage
          id="project-authors"
          values={{
            authorName: authors[0].username,
            number: authors.length - 1,
          }}
        />
      </span>
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
    const { showAuthorsModal } = this.state;
    this.setState({ showAuthorsModal: !showAuthorsModal });
  };

  render() {
    const { project } = this.props;
    const { showAuthorsModal } = this.state;
    const isMultipleAuthors = project.authors && project.authors.length > 1;

    return (
      <Container id="project-header">
        <ProjectHeaderAuthorsModal
          users={project.authors}
          onClose={this.closeAuthorsModal}
          show={showAuthorsModal}
        />
        <div>
          <UserAvatarList
            users={project && project.authors ? project.authors : []}
            onClick={this.handleClickModal}
            max={3}
          />
        </div>
        <AuthorsContainer>
          <AuthorsCreditContainer
            id="authors-credit"
            className="ml-5 p-0 font-weight-bold"
            onClick={isMultipleAuthors ? this.handleClickModal : null}
            href={!isMultipleAuthors && project.authors[0] ? project.authors[0].url : null}>
            {getAuthorCredits(project.authors)}
          </AuthorsCreditContainer>
        </AuthorsContainer>
      </Container>
    );
  }
}

export default createFragmentContainer(ProjectHeaderAuthors, {
  project: graphql`
    fragment ProjectHeaderAuthors_project on Project {
      id
      authors {
        username
        url
        ...UserAvatarList_users
        ...ProjectHeaderAuthorsModal_users
      }
    }
  `,
});
