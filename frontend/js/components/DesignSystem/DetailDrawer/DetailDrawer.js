// @flow
import * as React from 'react';
import { useEffect } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import styled from 'styled-components';
import { useKeyboardShortcuts } from '@liinkiing/react-hooks';
import { createPortal } from 'react-dom';
import { ease } from '~/utils/motion';
import AppBox from '~ui/Primitives/AppBox';
import DetailDrawerHeader from '~ds/DetailDrawer/DetailDrawerHeader';
import DetailDrawerBody from '~ds/DetailDrawer/DetailDrawerBody';
import { cleanChildren } from '~/utils/cleanChildren';
import config from '~/config';

export type Props = {|
  +isOpen: boolean,
  +onClose?: () => void,
  +children?: React.Node,
|};

const DRAWER_CONTAINER_ID = 'drawer-container';

let portal: HTMLDivElement;

if (config.canUseDOM && document) {
  portal = document.createElement('div');
  portal.id = DRAWER_CONTAINER_ID;
  if (document.body && !document.getElementById(DRAWER_CONTAINER_ID)) {
    document.body.appendChild(portal);
  }
}

const DetailDrawerInner = styled(motion.custom(AppBox)).attrs({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  bg: 'white',
  zIndex: 1030,
  display: 'flex',
  flexDirection: 'column',
})``;

const DetailDrawer = ({ isOpen, onClose, children }: Props) => {
  useEffect(() => {
    if (!window.document.body) return;
    if (isOpen === true) {
      window.document.body.style.setProperty('overflow', 'hidden');
    } else {
      window.document.body.style.removeProperty('overflow');
    }

    return () => {
      if (window.document.body) {
        window.document.body.style.removeProperty('overflow');
      }
    };
  }, [isOpen]);
  useKeyboardShortcuts([
    {
      keys: ['Escape'],
      action: onClose,
    },
  ]);
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <DetailDrawerInner
          initial={{ opacity: 0, x: '100vw' }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease }}
          exit={{ opacity: 0, x: '100vw' }}>
          {cleanChildren(children).map(child => React.cloneElement(child, { onClose }))}
        </DetailDrawerInner>
      )}
    </AnimatePresence>,
    portal,
  );
};

DetailDrawer.Header = DetailDrawerHeader;
DetailDrawer.Body = DetailDrawerBody;

DetailDrawer.displayName = 'DetailDrawer';

export default DetailDrawer;
