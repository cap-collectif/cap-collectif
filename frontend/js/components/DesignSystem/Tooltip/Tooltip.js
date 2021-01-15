// @flow
import * as React from 'react';
import css from '@styled-system/css';
import Tippy from '@tippyjs/react/headless';
import { motion, useSpring } from 'framer-motion';
import styled from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { TippyPlacementProps } from '~ds/common.type';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';
import Text from '~ui/Primitives/Text';

type Props = {|
  ...AppBoxProps,
  ...TippyPlacementProps,
  +label: React.Node,
  +truncate?: number,
  +trigger?: $ReadOnlyArray<'mouseenter' | 'focus' | 'click' | 'focusin' | 'manual'>,
  +isDisabled?: boolean,
  +useArrow?: boolean,
  +keepOnHover?: boolean,
  +delay?: number | [number | null, number | null],
  +showOnCreate?: boolean,
  +onShow?: (instance: any) => void | false,
  +onHide?: (instance: any) => void | false,
|};

const TooltipInner = styled(motion.custom(AppBox))`
  &[data-placement^='top'] > #arrow {
    bottom: -4px;
  }

  &[data-placement^='bottom'] > #arrow {
    top: -4px;
  }

  &[data-placement^='left'] > #arrow {
    right: -4px;
  }

  &[data-placement^='right'] > #arrow {
    left: -4px;
  }
`;

const Arrow = styled(AppBox)`
  &,
  &:before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: -1;
  }

  &:before {
    content: '';
    transform: rotate(45deg);
  }
`;

const INITIAL_SCALE = 0.8;

export const Tooltip = ({
  children,
  label,
  showOnCreate,
  onShow,
  onHide,
  delay = [400, null],
  truncate = 100,
  trigger = ['mouseenter', 'focus'],
  useArrow = true,
  keepOnHover = false,
  isDisabled = false,
  placement = 'top',
  ...props
}: Props) => {
  const opacity = useSpring(0, LAYOUT_TRANSITION_SPRING);
  const scale = useSpring(INITIAL_SCALE, LAYOUT_TRANSITION_SPRING);

  function onMount() {
    scale.set(1);
    opacity.set(1);
  }

  function onHideHandler(instance) {
    const cleanup = scale.onChange(value => {
      if (value <= INITIAL_SCALE) {
        cleanup();
        if (onHide) {
          onHide(instance);
        }
        instance.unmount();
      }
    });

    scale.set(INITIAL_SCALE);
    opacity.set(0);
  }
  return (
    <Tippy
      disabled={isDisabled}
      placement={placement}
      interactive={keepOnHover}
      delay={trigger.includes('click') ? 0 : delay}
      onMount={onMount}
      showOnCreate={showOnCreate}
      trigger={trigger.join(' ')}
      onHide={onHideHandler}
      animation
      popperOptions={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, useArrow ? 10 : 6],
            },
          },
          {
            name: 'arrow',
            options: {
              padding: 6,
            },
          },
        ],
      }}
      {...(onShow && { onShow })}
      render={attrs => (
        <TooltipInner
          p={1}
          bg="gray.900"
          color="white"
          borderRadius="tooltip"
          maxWidth="270px"
          {...attrs}
          {...props}
          style={{ scale, opacity }}>
          {typeof label === 'string' && (
            <Text minWidth={6} textAlign="center" lineHeight="sm" fontSize={1} truncate={truncate}>
              {label}
            </Text>
          )}
          {typeof label !== 'string' && <>{label}</>}
          {useArrow && (
            <Arrow
              css={css({
                '&::before': {
                  bg: props.bg ?? props.backgroundColor ?? 'gray.900',
                },
              })}
              id="arrow"
              data-popper-arrow
            />
          )}
        </TooltipInner>
      )}>
      {children}
    </Tippy>
  );
};

export default Tooltip;
