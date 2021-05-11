// @flow
import * as React from 'react';
import Grid from '~ui/Primitives/Layout/Grid';
import ProjectPreview from '~/components/Project/Preview/ProjectPreview';
import type { FeatureToggles } from '~/types';
import type { ProjectPreview_project$ref } from '~relay/ProjectPreview_project.graphql';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  +homePageProjectsSectionConfiguration: ?{|
    +projects: {|
      +edges: ?$ReadOnlyArray<?{|
        +node: {|
          +$fragmentRefs: ProjectPreview_project$ref,
        |},
      |}>,
    |},
  |},
  +features: FeatureToggles,
|};

const renderPreview = homePageProjectsSectionConfiguration => {
  if (!homePageProjectsSectionConfiguration) {
    return;
  }
  return homePageProjectsSectionConfiguration?.projects?.edges?.map((edge, index) => {
    const project = edge?.node;
    return <ProjectPreview key={index} project={project} isProjectsPage={false} />;
  });
};

const CustomProjectListView = ({ homePageProjectsSectionConfiguration, features }: Props) => {
  return (
    <>
      {features.unstable__new_project_card ? (
        <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
          {renderPreview(homePageProjectsSectionConfiguration)}
        </Grid>
      ) : (
        <Flex wrap="wrap">{renderPreview(homePageProjectsSectionConfiguration)}</Flex>
      )}
    </>
  );
};

export default CustomProjectListView;
