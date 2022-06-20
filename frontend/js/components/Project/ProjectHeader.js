// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import ProjectHeaderDistrictsList from '~/components/Project/ProjectHeaderDistrictsList';
import ProjectRestrictedAccessFragment from '~/components/Project/Page/ProjectRestrictedAccessFragment';
import ProjectStepTabs from '~/components/Project/ProjectStepTabs';
import ProjectHeaderBlocks from '~/components/Project/ProjectHeaderBlocks';
import ProjectHeaderShareButtons from '~/components/Project/ProjectHeaderShareButtons';
import type { ProjectHeader_project$key } from '~relay/ProjectHeader_project.graphql';
import ProjectHeaderLayout from '~ui/Project/ProjectHeader';
import ProjectHeaderAuthorList from '~/components/Project/Authors/ProjectHeaderAuthorList';
import ProjectHeaderThemeList from '~/components/Project/ProjectHeaderThemeList';
import ProjectArchivedTag from '~/components/Project/ProjectArchivedTag';

const FRAGMENT = graphql`
  fragment ProjectHeader_project on Project
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
    id
    title
    url
    hasParticipativeStep
    video
    cover {
      url
      name
    }
    districts {
      totalCount
    }
    themes {
      title
      url
      id
    }
    archived
    visibility
    ...ProjectHeaderAuthorList_project
    ...ProjectHeaderBlocks_project
    ...ProjectHeaderDistrictsList_project
    ...ProjectStepTabs_project
    ...ProjectRestrictedAccessFragment_project @arguments(count: $count, cursor: $cursor)
  }
`;
export type Props = {|
  +project: ProjectHeader_project$key,
  +isConsultation?: boolean,
|};
const ProjectHeader = ({ project, isConsultation }: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  const renderCover = () => {
    if (data.video) {
      return (
        <ProjectHeaderLayout.CoverVideo
          url={data.video}
          src={data.cover?.url}
          alt={data.cover?.name}
          isArchived={data.archived}
        />
      );
    }
    if (data.cover) {
      return (
        <ProjectHeaderLayout.CoverImage
          src={data.cover.url}
          alt={data.cover.name}
          isArchived={data.archived}
        />
      );
    }
  };
  return (
    <ProjectHeaderLayout>
      <ProjectHeaderLayout.Cover isArchived={data.archived}>
        <ProjectHeaderLayout.Content>
          <ProjectHeaderAuthorList project={data} />
          <ProjectHeaderLayout.Title>{data.title}</ProjectHeaderLayout.Title>
          {data.hasParticipativeStep && <ProjectHeaderBlocks project={data} />}
          <ProjectHeaderLayout.Info>
            {data.districts?.totalCount !== 0 && (
              <ProjectHeaderDistrictsList project={data} breakingNumber={3} />
            )}
            {!!data.themes && data.themes.length > 0 && (
              <ProjectHeaderThemeList
                breakingNumber={3}
                themes={data.themes}
                isArchived={data.archived}
              />
            )}
          </ProjectHeaderLayout.Info>
          <ProjectHeaderShareButtons url={data.url} title={data.title} />
        </ProjectHeaderLayout.Content>
        {renderCover()}
        <ProjectRestrictedAccessFragment project={data} />
        {data.archived && data.visibility === 'PUBLIC' && <ProjectArchivedTag />}
      </ProjectHeaderLayout.Cover>
      <ProjectStepTabs project={data} isConsultation={isConsultation} />
    </ProjectHeaderLayout>
  );
};

export default ProjectHeader;
