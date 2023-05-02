// @flow
import * as React from 'react';
import css from '@styled-system/css';
import Tippy from '@tippyjs/react/headless';
import { m as motion, useSpring } from 'framer-motion';
import styled from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { TippyPlacementProps } from '~ds/common.type';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';
import PopoverTrigger, { POPOVER_TRIGGER_TYPE } from './trigger';
import PopoverContent, { POPOVER_CONTENT_TYPE } from './content';
import PopoverHeader from './header';
import PopoverBody from './body';
import PopoverFooter from './footer';

type Props = {|
  ...AppBoxProps,
  ...TippyPlacementProps,
  +trigger?: $ReadOnlyArray<'mouseenter' | 'focus' | 'click' | 'focusin' | 'manual'>,
  +useArrow?: boolean,
  +keepOnHover?: boolean,
  +delay?: number | [number | null, number | null],
  +showOnCreate?: boolean,
  +onShow?: (instance: any) => void | false,
  +onHide?: (instance: any) => void | false,
|};

const PopoverInner = styled(motion(AppBox))`
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
    z-index: 0;
  }

  &:before {
    content: '';
    transform: rotate(45deg);
  }
`;

const INITIAL_SCALE = 0.8;

const Popover = ({
  children,
  showOnCreate,
  onShow,
  onHide,
  delay,
  trigger = ['mouseenter', 'focus'],
  useArrow,
  keepOnHover = true,
  isDisabled = false,
  placement = 'left',
  ...props
}: Props) => {
  const [tippyInstance, setTippyInstance] = React.useState(null);
  const opacity = useSpring(0, LAYOUT_TRANSITION_SPRING);
  const scale = useSpring(INITIAL_SCALE, LAYOUT_TRANSITION_SPRING);
  const triggerChild = React.Children.toArray(children).find(child => {
    if (React.isValidElement(child)) {
      return child.type.name === POPOVER_TRIGGER_TYPE;
    }
  });
  const popoverChildren = React.Children.toArray(children).find(
    child => child.type.name === POPOVER_CONTENT_TYPE,
  );

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

  return triggerChild ? (
    <Tippy
      disabled={isDisabled}
      placement={placement}
      interactive={keepOnHover}
      delay={trigger.includes('click') ? 0 : delay}
      onMount={onMount}
      onCreate={setTippyInstance}
      showOnCreate={showOnCreate}
      trigger={trigger.join(' ')}
      onHide={onHideHandler}
      animation
      popperOptions={{
        strategy: 'fixed',
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
        <PopoverInner {...attrs} {...props} style={{ scale, opacity }}>
          {popoverChildren &&
            React.cloneElement(popoverChildren, { closePopover: tippyInstance?.unmount })}

          {useArrow && (
            <Arrow
              css={css({
                '&::before': {
                  bg: props.bg ?? props.backgroundColor ?? 'white',
                },
              })}
              id="arrow"
              data-popper-arrow
            />
          )}
        </PopoverInner>
      )}>
      {triggerChild}
    </Tippy>
  ) : null;
};

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Header = PopoverHeader;
Popover.Body = PopoverBody;
Popover.Footer = PopoverFooter;

export default Popover;
