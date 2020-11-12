// @flow
import * as React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useToggle from '~/components/AdminEditor/hooks/useToggle';

type Props = {|
  /**
   * The value that needs to be copied to the clipboard
   */
  +value: string,
  /**
   * How long we display the copied text
   */
  +timeout?: number,
  +children: React.Node | ((isCopied: boolean) => React.Node),
|};

const CopyLinkButton = ({ children, value, timeout = 3000 }: Props) => {
  const [isCopied, toggleCopy] = useToggle(false);
  React.useEffect(() => {
    let handler = null;

    if (isCopied) {
      handler = setTimeout(() => {
        toggleCopy();
      }, timeout);
    }

    return () => {
      if (handler) {
        clearTimeout(handler);
      }
    };
  }, [isCopied, timeout, toggleCopy]);
  return (
    <CopyToClipboard
      text={value}
      onCopy={() => {
        if (!isCopied) {
          toggleCopy();
        }
      }}>
      {typeof children === 'function' ? children(isCopied) : children}
    </CopyToClipboard>
  );
};

export default CopyLinkButton;
