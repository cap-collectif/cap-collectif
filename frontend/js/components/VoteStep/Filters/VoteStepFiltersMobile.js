// @flow
import * as React from 'react';
import { Flex, Box, Text, CapUIIcon, Icon, CapUIIconSize } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import ResetCss from '~/utils/ResetCss';
import VoteStepFilterSearchBar from '~/components/VoteStep/Filters/VoteStepFilterSearchBar';
import VoteStepFiltersAccordions from '~/components/VoteStep/Filters/VoteStepFiltersAccordions';
import useVoteStepFilters from '~/components/VoteStep/Filters/useVoteStepFilters';
import { ACTIVE_COLOR } from '../utils';

type Props = {
  stepId: string,
  onClose: () => void,
};

const SaveButton = ({children, onClick}) => {
  return (
    <Box
      as="button"
      borderRadius="50px"
      padding={3}
      width="70%"
      maxWidth="240px"
      fontWeight={600}
      bg={ACTIVE_COLOR}
      color="white"
      border="none"
      fontSize={3}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}



const VoteStepFiltersMobile = ({ stepId, onClose }: Props) => {
  const intl = useIntl();
  const voteStepFilters = useVoteStepFilters(stepId);

  if (!voteStepFilters) {
    return null;
  }

  const { filters } = voteStepFilters;

  return (
    <Box
      bg="#F7FAFB"
      height="100%"
      minHeight="100vh"
      py={10}
      px={4}
      position="fixed"
      width="100%"
      zIndex={1030}
      top={0}
      overflow="scroll">
      <Flex justifyContent="space-between" mb={5}>
        <Text color={ACTIVE_COLOR} fontWeight={700} fontSize={5}>
          {intl.formatMessage({ id: 'filter-the-projects' })}
        </Text>
        <ResetCss>
          <Box as="button" onClick={onClose}>
            <Icon name={CapUIIcon.CrossO} size={CapUIIconSize.Sm} />
          </Box>
        </ResetCss>
      </Flex>
      <VoteStepFilterSearchBar />
      <VoteStepFiltersAccordions filters={filters} isMobile />
      <Flex justifyContent="center" mt={8}>
        <SaveButton onClick={onClose}>{intl.formatMessage({ id: 'global.save' })}</SaveButton>
      </Flex>
    </Box>
  );
};

export default VoteStepFiltersMobile;
