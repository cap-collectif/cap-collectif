// @flow
import { CapUIIcon, CapUIIconSize, Flex, Icon, Text, Box, useTheme } from '@cap-collectif/ui';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useEventListener } from '~/utils/hooks/useEventListener';
import type { GlobalState } from '~/types';
import { VoteStepEvent, View, ACTIVE_COLOR, dispatchEvent } from './utils';
import { useVoteStepContext } from './Context/VoteStepContext';

const MOBILE_COLOR = '#CE237F';

const ViewButton = ({
  icon,
  active,
  onClick,
  isMobile,
  text,
  children,
  ...rest
}: {|
  +icon: string,
  +onClick: () => void,
  +active: boolean,
  +isMobile: boolean,
  +borderTopLeftRadius?: string,
  +borderBottomLeftRadius?: string,
  +borderTopRightRadius?: string,
  +borderBottomRightRadius?: string,
  +borderRight?: string,
  +borderLeft?: string,
  +text: string,
  +children?: React.Node,
  +disabled?: boolean,
  +id?: string,
|}) => {
  const { view } = useVoteStepContext();

  return (
    <Flex
      as="button"
      bg="white"
      px={2}
      py={[2, 1]}
      justify="center"
      alignItems="center"
      onClick={onClick}
      border={isMobile ? 'none' : 'normal'}
      position="relative"
      {...rest}
      aria-label={text}
      borderColor={active ? [MOBILE_COLOR, ACTIVE_COLOR] : 'gray.300'}>
      <Icon
        name={icon}
        size={isMobile ? CapUIIconSize.Lg : CapUIIconSize.Md}
        color={active ? [MOBILE_COLOR, ACTIVE_COLOR] : 'gray.700'}
        opacity={rest.disabled ? '.5' : '1'}
        mr={[0, 0, 0, 1]}
      />
      {!isMobile ? (
        <Text
          opacity={rest.disabled ? '.5' : '1'}
          as="span"
          fontSize={3}
          color={active ? ACTIVE_COLOR : 'gray.700'}
          display={view === View.Map ? ['none', 'none', 'none', 'inline'] : 'inline'}>
          {text}
        </Text>
      ) : null}
      {children}
    </Flex>
  );
};

export const ViewChangePanel = ({ isMobile = false }: {| +isMobile?: boolean |}) => {
  const intl = useIntl();
  const [hasNewVote, setHasNewVote] = React.useState(false);
  const { user } = useSelector((state: GlobalState) => state.user);
  const { view, setView, setFilters } = useVoteStepContext();
  const { colors } = useTheme();

  useEventListener(VoteStepEvent.AddVote, () => setHasNewVote(true));

  return (
    <Flex
      position="relative"
      flex="none"
      mt={0}
      zIndex={2}
      borderRadius="normal"
      overflow="hidden"
      boxShadow={isMobile ? 'small' : 'unset'}
      id="view-change-panel">
      <ViewButton
        isMobile={isMobile}
        onClick={() => {
          setView(View.List);
          dispatchEvent(VoteStepEvent.ClickProposal, { id: null });
        }}
        active={view === View.List}
        icon={CapUIIcon.List}
        borderTopLeftRadius="normal"
        borderBottomLeftRadius="normal"
        borderRight={view === View.List && !isMobile ? 'normal' : 'none'}
        text={intl.formatMessage({ id: 'global.list' })}
        id="change-to-list-view"
      />
      <Box
        display={['none', 'none', 'none', 'block']}
        borderColor={`${colors.gray[300]} !important`}
        bg="white"
        width={2}
        borderTop="normal"
        borderBottom="normal"
      />
      <ViewButton
        isMobile={isMobile}
        onClick={() => {
          setView(View.Map)
          if (isMobile) {
            setFilters('term', '')
          }
        }}
        active={view === View.Map}
        icon={CapUIIcon.Map}
        borderRight={view === View.Map && !isMobile ? 'normal' : 'none'}
        borderLeft={view === View.Map && !isMobile ? 'normal' : 'none'}
        text={intl.formatMessage({ id: 'global.card' })}
        id="change-to-map-view"
      />
      <Box
        display={['none', 'none', 'none', 'block']}
        borderColor={`${colors.gray[300]} !important`}
        bg="white"
        width={2}
        borderTop="normal"
        borderBottom="normal"
      />
      <ViewButton
        disabled={!user}
        isMobile={isMobile}
        onClick={() => {
          setHasNewVote(false);
          setView(View.Votes);
        }}
        active={view === View.Votes}
        icon={CapUIIcon.Vote}
        borderTopRightRadius="normal"
        borderBottomRightRadius="normal"
        borderLeft={view === View.Votes && !isMobile ? 'normal' : 'none'}
        text={intl.formatMessage({ id: 'project.votes.title' })}
        id="change-to-votes-view">
        {hasNewVote ? (
          <Box
            bg="white"
            border="normal"
            borderColor="white"
            height={[3, 2]}
            width={[3, 2]}
            position="absolute"
            top={2}
            left={[7, '1.5rem']}>
            <Box bg="red.500" borderRadius="100%" height="100%" width="100%" />
          </Box>
        ) : null}
      </ViewButton>
    </Flex>
  );
};

export default ViewChangePanel;
