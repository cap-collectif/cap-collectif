// @flow
import { CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui';
import * as React from 'react';

export type VIEW = 'list' | 'card' | 'votes';

const ViewButton = ({
  icon,
  active,
  onClick,
  isMobile,
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
    {...rest}
    borderColor={active ? 'green.700' : 'gray.300'}>
    <Icon
      name={icon}
      size={isMobile ? CapUIIconSize.Lg : CapUIIconSize.Md}
      color={active ? 'green.700' : 'gray.700'}
    />
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
|}) => (
  <Flex
    position={['absolute', 'relative']}
    mt={[6, 0]}
    zIndex={2}
    right={[4, 0]}
    borderRadius="normal"
    overflow="hidden"
    boxShadow={isMobile ? 'small' : ''}>
    <ViewButton
      isMobile={isMobile}
      onClick={() => setView('list')}
      active={view === 'list'}
      icon={CapUIIcon.List}
      borderTopLeftRadius="normal"
      borderBottomLeftRadius="normal"
      borderRight={view === 'list' && !isMobile ? 'normal' : 'none'}
    />
    <ViewButton
      isMobile={isMobile}
      onClick={() => setView('card')}
      active={view === 'card'}
      icon={CapUIIcon.Map}
      borderRight={view === 'card' && !isMobile ? 'normal' : 'none'}
      borderLeft={view === 'card' && !isMobile ? 'normal' : 'none'}
    />
    <ViewButton
      isMobile={isMobile}
      onClick={() => setView('votes')}
      active={view === 'votes'}
      icon={CapUIIcon.Vote}
      borderTopRightRadius="normal"
      borderBottomRightRadius="normal"
      borderLeft={view === 'votes' && !isMobile ? 'normal' : 'none'}
    />
  </Flex>
);

export default ViewChangePanel;
