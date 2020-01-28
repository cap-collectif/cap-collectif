// @flow
import React, { useEffect } from 'react';
import AlertContainer from './Alert.style';
import Icon from '~/components/Ui/Icons/Icon';

type Props = {|
  children: $FlowFixMe,
  type: string,
  timeout?: number,
  onDismiss?: () => void,
|};

const Alert = ({ children, type, onDismiss, timeout = 10000 }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      if (typeof onDismiss === 'function') onDismiss();
    }, timeout);
  }, [onDismiss, timeout]);

  return (
    <AlertContainer type={type}>
      {children}
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="btn-close">
          <Icon size={10} viewBox="0 0 10 10" name="close" />
        </button>
      )}
    </AlertContainer>
  );
};

export default Alert;
