// @flow
import moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import UserAvatarList from '../../User/UserAvatarList';
import type { ProjectHeaderAuthors_project } from '~relay/ProjectHeaderAuthors_project.graphql';

type Props = {
  project: ProjectHeaderAuthors_project,
};

const Container = styled.div.attrs({})`
  display: flex;
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

export const ProjectHeaderAuthors = (props: Props) => {
  const { project } = props;

  return (
    <Container>
      <div>
        {/* $FlowFixMe $refType */}
        <UserAvatarList users={project && project.authors ? project.authors : []} />
      </div>
      <div className="ml-10">
        <span className="font-weight-bold">{getAuthorCredits(project.authors)}</span>
        <br />
        <FormattedDate
          value={moment(project.publishedAt).toDate()}
          minute="numeric"
          hour="numeric"
          day="numeric"
          month="long"
          year="numeric"
        />
      </div>
    </Container>
  );
};

export default createFragmentContainer(ProjectHeaderAuthors, {
  project: graphql`
    fragment ProjectHeaderAuthors_project on Project {
      id
      publishedAt
      authors {
        username
        ...UserAvatarList_users
      }
    }
  `,
});
