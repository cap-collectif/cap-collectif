// @flow
import { CapUIIcon, CapUIIconSize, Flex, Icon, Text, Box } from '@cap-collectif/ui';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useEventListener } from '~/utils/hooks/useEventListener';
import type { GlobalState } from '~/types';

export type VIEW = 'list' | 'card' | 'votes';

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
|}) => (
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
    opacity={rest.disabled ? '.5' : '1'}
    {...rest}
    borderColor={active ? 'green.700' : 'gray.300'}>
    <Icon
      name={icon}
      size={isMobile ? CapUIIconSize.Lg : CapUIIconSize.Md}
      color={active ? 'green.700' : 'gray.700'}
    />
    {!isMobile ? (
      <Text as="span" fontSize={3} color={active ? 'green.700' : 'gray.700'}>
        {text}
      </Text>
    ) : null}
    {children}
  </Flex>
);

export const ViewChangePanel = ({
  view,
  setView,
  isMobile = false,
}: {|
  +view: VIEW,
  +setView: VIEW => void,
  +isMobile?: boolean,
|}) => {
  const intl = useIntl();
  const [hasNewVote, setHasNewVote] = React.useState(false);
  const { user } = useSelector((state: GlobalState) => state.user);

  useEventListener('new-vote', () => {
    setHasNewVote(true);
  });

  return (
    <Flex
      position={['absolute', 'relative']}
      mt={[6, 0]}
      zIndex={2}
      right={[4, 0]}
      borderRadius="normal"
      overflow="hidden"
      boxShadow={isMobile ? 'small' : 'unset'}>
      <ViewButton
        isMobile={isMobile}
        onClick={() => setView('list')}
        active={view === 'list'}
        icon={CapUIIcon.List}
        borderTopLeftRadius="normal"
        borderBottomLeftRadius="normal"
        borderRight={view === 'list' && !isMobile ? 'normal' : 'none'}
        text={intl.formatMessage({ id: 'global.list' })}
      />
      <ViewButton
        isMobile={isMobile}
        onClick={() => setView('card')}
        active={view === 'card'}
        icon={CapUIIcon.Map}
        borderRight={view === 'card' && !isMobile ? 'normal' : 'none'}
        borderLeft={view === 'card' && !isMobile ? 'normal' : 'none'}
        text={intl.formatMessage({ id: 'global.card' })}
      />
      <ViewButton
        disabled={!user}
        isMobile={isMobile}
        onClick={() => {
          setHasNewVote(false);
          setView('votes');
        }}
        active={view === 'votes'}
        icon={CapUIIcon.Vote}
        borderTopRightRadius="normal"
        borderBottomRightRadius="normal"
        borderLeft={view === 'votes' && !isMobile ? 'normal' : 'none'}
        text={intl.formatMessage({ id: 'project.votes.title' })}>
        {hasNewVote ? (
          <Box
            bg="white"
            border="normal"
            borderColor="white"
            height={2}
            width={2}
            position="absolute"
            top={2}
            left="1.5rem">
            <Box bg="red.500" borderRadius="100%" height="100%" width="100%" />
          </Box>
        ) : null}
      </ViewButton>
    </Flex>
  );
};

export default ViewChangePanel;
