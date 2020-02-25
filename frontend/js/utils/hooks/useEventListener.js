// @flow
import { useEffect, useRef } from 'react';

export const useEventListener = (
  eventName: string,
  handler: (e: Event) => void,
  element: any = window,
): void => {
  const savedHandler: any = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = event => savedHandler.current(event);

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};
