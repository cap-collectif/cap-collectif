// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { AnalysisListProjectPage_projects } from '~relay/AnalysisListProjectPage_projects.graphql';
import ProjectAnalysisPreview from '~/components/Project/Preview/ProjectAnalysisPreview/ProjectAnalysisPreview';
import AnalysisListProjectPageContainer from '~/components/Analysis/AnalysisListProjectPage/AnalysisListProjectPage.style';

type Props = {
  projects: AnalysisListProjectPage_projects,
};

const AnalysisListProjectPage = ({ projects }: Props) => (
  <AnalysisListProjectPageContainer>
    <FormattedMessage tagName="h2" id="my-projects" />

    {projects.map((project, i) => (
      <ProjectAnalysisPreview key={i} project={project} url={`/project/${project.slug}`} />
    ))}
  </AnalysisListProjectPageContainer>
);

export default createFragmentContainer(AnalysisListProjectPage, {
  projects: graphql`
    fragment AnalysisListProjectPage_projects on Project @relay(plural: true) {
      slug
      ...ProjectAnalysisPreview_project
    }
  `,
});
