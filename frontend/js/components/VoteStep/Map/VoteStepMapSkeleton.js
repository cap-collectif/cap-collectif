// @flow
import * as React from 'react';
import { Box, Flex, Skeleton } from '@cap-collectif/ui';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';

const ICON_COLOR = '#5E5E5E';

type Props = {| +top: string, +left: string |};

const GroupPlaceholder = ({ top, left }: Props) => (
  <Flex
    borderRadius="100%"
    width="7rem"
    height="7rem"
    bg="gray.150"
    justifyContent="center"
    alignItems="center"
    position="absolute"
    top={top}
    left={left}>
    <Box height="4.5rem" width="4.5rem" borderRadius="100%" bg="gray.200" />
  </Flex>
);

const IconPlaceholder = ({ top, left }: Props) => (
  <Box position="absolute" top={top} left={left} opacity=".15">
    <Icon name={ICON_NAME.pin3} size={48} color={ICON_COLOR} />
  </Box>
);

export const VoteStepMapSkeleton = () => (
  <Box
    width="100%"
    id="map-skeleton"
    position="relative"
    height="calc(100vh - 140px)"
    bg="gray.100">
    <Box position="absolute" top="1.4rem" right="1.4rem" display={['none', 'block']}>
      <Skeleton.Text height={7} width={7} mb={4} />
      <Skeleton.Text height={7} width={7} mb={1} />
      <Skeleton.Text height={7} width={7} />
    </Box>
    <GroupPlaceholder top="15%" left="15%" />
    <GroupPlaceholder top="60%" left="35%" />
    <IconPlaceholder top="25%" left="65%" />
    <IconPlaceholder top="60%" left="65%" />
    <IconPlaceholder top="45%" left="25%" />
    <IconPlaceholder top="65%" left="10%" />
  </Box>
);

export default VoteStepMapSkeleton;
