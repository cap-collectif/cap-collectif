// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import AppBox from '~ui/Primitives/AppBox';
import RenderCustomAccess from './RenderCustomAccess';
import RenderPrivateAccess from './RenderPrivateAccess';
import type { ProjectRestrictedAccessFragment_project$key } from '~relay/ProjectRestrictedAccessFragment_project.graphql';

type Props = {
  project: ProjectRestrictedAccessFragment_project$key,
  isOnProjectCard?: boolean,
};

const FRAGMENT = graphql`
  fragment ProjectRestrictedAccessFragment_project on Project
    @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
    visibility

    ...RenderCustomAccess_project @arguments(count: $count, cursor: $cursor)
    ...RenderPrivateAccess_project
  }
`;

const ProjectRestrictedAccessFragment = ({
  project,
  isOnProjectCard = false,
}: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  if (data && data.visibility) {
    if (data.visibility === 'CUSTOM') {
      return (
        <AppBox
          style={{ cursor: 'pointer' }}
          position="absolute"
          top={isOnProjectCard ? '-44px' : '12px'}
          right={isOnProjectCard ? 0 : '10px'}>
          <React.Fragment>
            <RenderCustomAccess project={data} isOnProjectCard={isOnProjectCard} />
          </React.Fragment>
        </AppBox>
      );
    }
    if (data.visibility === 'ME' || data.visibility === 'ADMIN') {
      return (
        <AppBox
          position="absolute"
          top={isOnProjectCard ? '-44px' : '12px'}
          right={isOnProjectCard ? 0 : '10px'}>
          <React.Fragment>
            <RenderPrivateAccess project={data} isOnProjectCard={isOnProjectCard} />
          </React.Fragment>
        </AppBox>
      );
    }
  }
  return null;
};

export default ProjectRestrictedAccessFragment;
