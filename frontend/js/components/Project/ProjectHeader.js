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

const FRAGMENT = graphql`
  fragment ProjectHeader_project on Project
    @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
    id
    title
    url
    hasParticipativeStep
    cover {
      url
      name
    }
    districts {
      totalCount
    }
    themes {
      id
    }
    ...ProjectHeaderThemeList_project
    ...ProjectHeaderAuthorList_project
    ...ProjectHeaderBlocks_project
    ...ProjectHeaderDistrictsList_project
    ...ProjectStepTabs_project
    ...ProjectRestrictedAccessFragment_project @arguments(count: $count, cursor: $cursor)
  }
`;
export type Props = {|
  +project: ProjectHeader_project$key,
|};
const ProjectHeader = ({ project }: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  return (
    <ProjectHeaderLayout>
      <ProjectHeaderLayout.Cover>
        <ProjectHeaderLayout.Content>
          <ProjectHeaderAuthorList project={data} />
          <ProjectHeaderLayout.Title>{data.title}</ProjectHeaderLayout.Title>
          {data.hasParticipativeStep && <ProjectHeaderBlocks project={data} />}
          <ProjectHeaderLayout.Info>
            {data.districts?.totalCount !== 0 && (
              <ProjectHeaderDistrictsList project={data} breakingNumber={3} />
            )}
            {!!data.themes && data.themes.length > 0 && (
              <ProjectHeaderThemeList breakingNumber={3} project={data} />
            )}
          </ProjectHeaderLayout.Info>
          <ProjectHeaderShareButtons url={data.url} title={data.title} />
        </ProjectHeaderLayout.Content>
        {data.cover && (
          <ProjectHeaderLayout.CoverImage src={data.cover.url} alt={data.cover.name} />
        )}
        <ProjectRestrictedAccessFragment project={data} />
      </ProjectHeaderLayout.Cover>
      <ProjectStepTabs project={data} />
    </ProjectHeaderLayout>
  );
};

export default ProjectHeader;
