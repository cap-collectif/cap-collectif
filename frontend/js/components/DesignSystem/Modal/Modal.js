// @flow
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Dialog, DialogDisclosure, useDialogState } from 'reakit/Dialog';
import { AnimatePresence, m as motion } from 'framer-motion';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import AppBox from '~ui/Primitives/AppBox';
import { ease, LAYOUT_TRANSITION_SPRING } from '~/utils/motion';
import ModalHeader from '~ds/Modal/ModalHeader';
import ModalBody from '~ds/Modal/ModalBody';
import ModalFooter from '~ds/Modal/ModalFooter';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { Context } from './Modal.context';
import { ModalContext } from './Modal.context';
import useIsMobile from '~/utils/hooks/useIsMobile';
import invariant from '~/utils/invariant';

type RenderProps = (props: Context) => React.Node;
export type ModalProps = {|
  ...AppBoxProps,
  +hideOnClickOutside?: boolean,
  +noBackdrop?: boolean,
  +hideCloseButton?: boolean,
  +scrollBehavior?: 'inside' | 'outside',
  +hideOnEsc?: boolean,
  +preventBodyScroll?: boolean,
  +disclosure?: React$Element<any>,
  +show?: boolean,
  +children: RenderProps | React.Node,
  +ariaLabel: string,
  +onOpen?: () => void,
  +onClose?: () => void,
  +fullSizeOnMobile?: boolean,
  +fullPageScrollable?: boolean,
|};
const ModalContainerInner = styled(motion.custom(AppBox)).attrs(({ zIndex }) => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  p: [0, 4],
  pt: [2, 4],
  zIndex,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}))``;
const ModalInner = styled(motion.custom(AppBox)).attrs(
  ({ fullSizeOnMobile, fullPageScrollable, ...rest }) => ({
    display: 'flex',
    bg: 'white',
    flexDirection: 'column',
    mt: [fullSizeOnMobile || fullPageScrollable ? 0 : 'auto', 0],
    width: ['100%', '50%'],
    boxShadow: 'medium',
    borderRadius: 'modal',
    borderBottomLeftRadius: [fullSizeOnMobile || fullPageScrollable ? 'modal' : 0, 'modal'],
    borderBottomRightRadius: [fullSizeOnMobile || fullPageScrollable ? 'modal' : 0, 'modal'],
    overflowY: 'auto',
    ...rest,
  }),
)``;

type ProviderProps = {| +children: React$Node, +context: Context |};
const Provider = React.memo<ProviderProps>(
  ({ context, children }: ProviderProps) => (
    <ModalContext.Provider value={context}>{children}</ModalContext.Provider>
  ),
  (prev, current) => prev.context === current.context,
);
const TRANSITION_DURATION = 0.2;
const Modal = ({
  children,
  disclosure,
  ariaLabel,
  onOpen,
  onClose,
  show,
  noBackdrop = false,
  scrollBehavior = 'inside',
  hideCloseButton = false,
  hideOnClickOutside = true,
  hideOnEsc = true,
  preventBodyScroll = true,
  fullPageScrollable = false,
  zIndex,
  ...props
}: ModalProps) => {
  const isControlled = show === true || show === false;
  invariant(
    (isControlled && disclosure === undefined) || (!isControlled && disclosure !== undefined),
    "You should either have a controlled Modal by using `show` props, or use the `disclosure` prop which will handle it's state internally, but you cannot use both or nothing.",
  );
  const firstMount = useRef(true);
  const dialog = useDialogState({
    animated: TRANSITION_DURATION * 1000,
    visible: show,
  });
  const isMobile = useIsMobile();
  const $container = useRef<?HTMLElement>();
  const $scrollBox = useRef<?HTMLElement>();
  const context = useMemo(
    () => ({
      hide: dialog.hide,
      show: dialog.show,
      toggle: dialog.toggle,
      visible: dialog.visible,
      hideCloseButton,
      fullPageScrollable,
    }),
    [dialog, hideCloseButton, fullPageScrollable],
  );
  useEffect(() => {
    const scrollContainer = $scrollBox.current;
    if (dialog.visible) {
      if (preventBodyScroll) {
        disableBodyScroll(scrollContainer);
      }
    }
    return () => {
      if (scrollContainer && preventBodyScroll) {
        enableBodyScroll(scrollContainer);
      }
    };
  }, [dialog.visible, preventBodyScroll]);
  useEffect(() => {
    if (dialog.visible && firstMount.current === true) {
      if (onOpen) {
        onOpen();
      }
      firstMount.current = false;
    } else if (!dialog.visible && firstMount.current === false) {
      if (onClose) {
        onClose();
      }
    }
  }, [onOpen, onClose, dialog.visible]);
  useEffect(() => {
    if (show === true) {
      dialog.show();
    } else if (show === false) {
      dialog.hide();
    }
  }, [dialog, show]);
  const aria = ariaLabel ?? props['aria-label'] ?? undefined;
  return (
    <Provider context={context}>
      <DialogDisclosure
        {...dialog}
        {...(disclosure ? { ref: disclosure.ref, ...disclosure.props } : {})}>
        {disclosureProps => (disclosure ? React.cloneElement(disclosure, disclosureProps) : null)}
      </DialogDisclosure>
      <Dialog
        {...dialog}
        aria-label={aria}
        hideOnClickOutside={hideOnClickOutside}
        hideOnEsc={hideOnEsc}
        preventBodyScroll={preventBodyScroll}>
        <AnimatePresence>
          {dialog.visible && (
            <ModalContainerInner
              bg={noBackdrop ? 'transparent' : 'rgba(0,0,0,0.5)'}
              overflow={scrollBehavior === 'outside' ? 'auto' : undefined}
              ref={$container}
              onClick={(e: MouseEvent) => {
                if (e.target === $container.current && hideOnClickOutside) {
                  dialog.hide();
                }
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: TRANSITION_DURATION, ease }}
              exit={{ opacity: 0 }}
              zIndex={zIndex || 1030}>
              <ModalInner
                overflow={scrollBehavior === 'inside' ? 'overlay' : undefined}
                initial={{ opacity: 0, y: isMobile ? 20 : -20 }}
                animate={{ opacity: 1, y: 0 }}
                ref={$scrollBox}
                transition={{
                  opacity: { duration: TRANSITION_DURATION, ease },
                  y: LAYOUT_TRANSITION_SPRING,
                }}
                exit={{ opacity: 0, y: isMobile ? 20 : -20 }}
                {...props}>
                {typeof children === 'function' ? children(context) : children}
              </ModalInner>
            </ModalContainerInner>
          )}
        </AnimatePresence>
      </Dialog>
    </Provider>
  );
};
Modal.displayName = 'Modal';
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
export default Modal;
