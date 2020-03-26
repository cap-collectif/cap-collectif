// @flow
import * as React from 'react';
import { Link } from 'react-router-dom';
import { createFragmentContainer, graphql } from 'react-relay';
import type { AnalysisListProjectPage_projects } from '~relay/AnalysisListProjectPage_projects.graphql';

type Props = {
  projects: AnalysisListProjectPage_projects,
};

const AnalysisListProjectPage = ({ projects }: Props) => (
  <div>
    <p>Page of projects analysis</p>
    {projects.map(({ title, slug }) => (
      <Link
        key={title}
        to={{
          pathname: `/project/${slug}`,
        }}>
        <p>{title}</p>
      </Link>
    ))}
  </div>
);

export default createFragmentContainer(AnalysisListProjectPage, {
  projects: graphql`
    fragment AnalysisListProjectPage_projects on Project @relay(plural: true) {
      title
      slug
    }
  `,
});
