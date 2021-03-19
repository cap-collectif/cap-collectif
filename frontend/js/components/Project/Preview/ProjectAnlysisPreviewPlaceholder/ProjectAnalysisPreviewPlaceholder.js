// @flow
import * as React from 'react';
import Skeleton from '~ds/Skeleton';
import Flex from '~ui/Primitives/Layout/Flex';

const ProjectAnalysisPreviewPlaceholder = () => (
  <Flex
    direction="row"
    align="center"
    height="110px"
    width="100%"
    mb={5}
    bg="white"
    border="normal"
    borderColor="gray.150"
    borderRadius="normal"
    overflow="hidden">
    <Skeleton.Text
      height="100%"
      width="100px"
      borderTopRightRadius={0}
      borderBottomRightRadius={0}
    />

    <Flex direction="row" width="100%" height="100%" justify="space-between" align="center" p={5}>
      <Flex direction="column">
        <Skeleton.Text bg="blue.200" size="md" mb={3} width="320px" />
        <Skeleton.Text size="md" width="260px" />
      </Flex>

      <Flex direction="row">
        <Skeleton.Text size="md" width="150px" mr={7} />
        <Skeleton.Text size="md" width="150px" />
      </Flex>
    </Flex>
  </Flex>
);

export default ProjectAnalysisPreviewPlaceholder;
