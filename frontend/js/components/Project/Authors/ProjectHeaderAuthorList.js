// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useDisclosure } from '@liinkiing/react-hooks';
import { Avatar } from '@cap-collectif/ui';
import ColorHash from 'color-hash';
import type { ProjectHeaderAuthorList_project$key } from '~relay/ProjectHeaderAuthorList_project.graphql';
import ProjectHeaderLayout from '~ui/Project/ProjectHeader';
import ProjectHeaderAuthorsModal from '~/components/Project/Authors/ProjectHeaderAuthorsModal';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import { colorContrast } from '~/utils/colorContrast';

const FRAGMENT = graphql`
  fragment ProjectHeaderAuthorList_project on Project {
    ...ProjectHeaderAuthorsModal_project
    authors {
      __typename
      id
      username
      url
      avatarUrl
    }
  }
`;
export type Props = {|
  +project: ProjectHeaderAuthorList_project$key,
|};
const ProjectHeaderAuthorList = ({ project }: Props): React.Node => {
  const profilesToggle = useFeatureFlag('profiles');
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const data = useFragment(FRAGMENT, project);
  if (data.authors && data.authors.length > 0) {
    const firstAuthor = data.authors[0];
    if (data.authors.length === 1) {
      const hash = new ColorHash();
      const backgroundColor = hash.hex(firstAuthor.username);
      const computedColor = colorContrast(backgroundColor);
      const showProfileLink = profilesToggle || firstAuthor.__typename === 'Organization';
      return (
        <ProjectHeaderLayout.Authors
          active={showProfileLink}
          style={{ cursor: showProfileLink ? 'pointer' : 'default' }}
          onClick={() => showProfileLink ? window.open(firstAuthor.url, '_self') : null}
          authors={data.authors}>
          <Avatar
            key={firstAuthor.id}
            name={firstAuthor.username}
            src={firstAuthor.avatarUrl}
            color={computedColor}
            backgroundColor={backgroundColor}
          />
        </ProjectHeaderLayout.Authors>
      );
    }
    return (
      <>
        <ProjectHeaderAuthorsModal project={data} onClose={onClose} show={isOpen} />
        <ProjectHeaderLayout.Authors
          active={profilesToggle}
          style={{ cursor: profilesToggle ? 'pointer' : 'default' }}
          onClick={onOpen}
          authors={data.authors}>
          {data.authors.map(author => (
            <Avatar key={author.id} name={author.username} src={author.avatarUrl} />
          ))}
        </ProjectHeaderLayout.Authors>
      </>
    );
  }
  return null;
};

export default ProjectHeaderAuthorList;
