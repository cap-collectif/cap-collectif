// @flow
import * as React from 'react';
import { useKeyboardShortcuts } from '@liinkiing/react-hooks';
import * as S from './index.style';
import { useInlineSelect } from '~ui/InlineSelect/useInlineSelect';

type Props = {|
  +value: string,
  +children: React.Node,
|};

const InlineSelectChoice = ({ children, value }: Props) => {
  const { onChange, value: selectValue } = useInlineSelect();
  const element = React.useRef<HTMLElement | null>(null);
  const handler = React.useCallback(() => {
    if (onChange) {
      onChange(value);
    }
  }, [onChange, value]);
  useKeyboardShortcuts(
    [
      {
        preventDefault: true,
        keys: ['Space', 'Enter'],
        action: handler,
      },
    ],
    element,
    [handler],
  );
  return (
    <S.Container ref={element} tabIndex={0} onClick={handler} active={value === selectValue}>
      {children}
    </S.Container>
  );
};

InlineSelectChoice.displayName = 'InlineSelect.Choice';

export default InlineSelectChoice;
