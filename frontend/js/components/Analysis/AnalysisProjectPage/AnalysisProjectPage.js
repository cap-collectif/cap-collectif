// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { AnalysisProjectPage_project } from '~relay/AnalysisProjectPage_project.graphql';

type Props = {
  project: AnalysisProjectPage_project,
};

const AnalysisProjectPage = ({ project }: Props) => <p>Page of project {project.title} </p>;

export default createFragmentContainer(AnalysisProjectPage, {
  project: graphql`
    fragment AnalysisProjectPage_project on Project {
      title
    }
  `,
});
