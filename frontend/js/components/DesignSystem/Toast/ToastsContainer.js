// @flow
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { m as motion } from 'framer-motion';
import Toast, { type ToastProps } from './Toast';
import { Emitter } from '~/config';
import { UIEvents } from '~/dispatchers/enums';
import AppBox from '~ui/Primitives/AppBox';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';

const ToastWrapper = styled(motion(AppBox)).attrs({
  width: ['100%', 'auto'],
})``;

const common = css`
  position: fixed;
  pointer-events: none;
  flex-direction: column;
  z-index: 10000;
  align-items: center;
  display: none;
  ${props =>
    props.visible &&
    css`
      display: flex;
    `};
`;

const ToastsContainer = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const clearToast = (id: string) => {
    setToasts(v => v.filter(toast => toast.id !== id));
  };
  useEffect(() => {
    Emitter.on(UIEvents.ToastShow, (toast: ToastProps) => {
      setToasts(n => [...n, toast]);
    });
    Emitter.on(UIEvents.ToastClear, () => {
      setToasts([]);
    });

    return () => {
      Emitter.removeAllListeners(UIEvents.ToastShow);
      Emitter.removeAllListeners(UIEvents.ToastClear);
    };
  }, []);

  return (
    <>
      <AppBox
        className="toasts-container toasts-container--top"
        visible={toasts.length > 0}
        top={2}
        left={0}
        right={0}
        bottom={0}
        css={common}>
        {toasts
          .filter(n => n.position === 'top')
          .map(n => (
            <ToastWrapper key={n.id} layout transition={LAYOUT_TRANSITION_SPRING}>
              <Toast {...n} onHide={clearToast} />
            </ToastWrapper>
          ))}
      </AppBox>
      <AppBox
        className="toasts-container toasts-container--top-left"
        visible={toasts.length > 0}
        top={2}
        left={2}
        right={0}
        bottom={0}
        css={css`
          ${(common: any)};
          align-items: flex-start;
        `}>
        {toasts
          .filter(n => n.position === 'top-left')
          .map(n => (
            <ToastWrapper key={n.id} layout transition={LAYOUT_TRANSITION_SPRING}>
              <Toast {...n} onHide={clearToast} />
            </ToastWrapper>
          ))}
      </AppBox>
      <AppBox
        className="toasts-container toasts-container--top-right"
        visible={toasts.length > 0}
        top={2}
        left={0}
        right={2}
        bottom={0}
        css={css`
          ${(common: any)};
          align-items: flex-end;
        `}>
        {toasts
          .filter(n => n.position === 'top-right')
          .map(n => (
            <ToastWrapper key={n.id} layout transition={LAYOUT_TRANSITION_SPRING}>
              <Toast {...n} onHide={clearToast} />
            </ToastWrapper>
          ))}
      </AppBox>
      <AppBox
        className="toasts-container toasts-container--bottom"
        visible={toasts.length > 0}
        top={0}
        left={0}
        right={0}
        bottom={2}
        css={`
          ${(common: any)};
          flex-direction: column-reverse;
        `}>
        {toasts
          .filter(n => n.position === 'bottom')
          .reverse()
          .map(n => (
            <ToastWrapper key={n.id} layout transition={LAYOUT_TRANSITION_SPRING}>
              <Toast {...n} onHide={clearToast} />
            </ToastWrapper>
          ))}
      </AppBox>
      <AppBox
        className="toasts-container toasts-container--bottom-left"
        visible={toasts.length > 0}
        top={0}
        left={2}
        right={0}
        bottom={2}
        css={css`
          ${(common: any)};
          align-items: flex-start;
          flex-direction: column-reverse;
        `}>
        {toasts
          .filter(n => n.position === 'bottom-left')
          .reverse()
          .map(n => (
            <ToastWrapper key={n.id} layout transition={LAYOUT_TRANSITION_SPRING}>
              <Toast {...n} onHide={clearToast} />
            </ToastWrapper>
          ))}
      </AppBox>
      <AppBox
        className="toasts-container toasts-container--bottom-right"
        visible={toasts.length > 0}
        top={0}
        left={0}
        right={2}
        bottom={2}
        css={css`
          ${(common: any)};
          flex-direction: column-reverse;
          align-items: flex-end;
        `}>
        {toasts
          .filter(n => n.position === 'bottom-right')
          .reverse()
          .map(n => (
            <ToastWrapper key={n.id} layout transition={LAYOUT_TRANSITION_SPRING}>
              <Toast {...n} onHide={clearToast} />
            </ToastWrapper>
          ))}
      </AppBox>
    </>
  );
};

export default ToastsContainer;
