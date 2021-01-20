// @flow
import * as React from 'react';
import css from '@styled-system/css';
import { useKeyboardShortcuts } from '@liinkiing/react-hooks';
import { useInlineSelect } from '~ui/InlineSelect/useInlineSelect';
import Tag, { type Props as TagProps } from '~ds/Tag/Tag';
import AppBox from '~ui/Primitives/AppBox';

const styles = css({
  '&:hover': {
    backgroundColor: 'blue.150',
    cursor: 'pointer',
  },
});

type Props = {|
  ...TagProps,
  +value: string,
  +children: React.Node,
|};

const InlineSelectChoice = ({ children, value, ...props }: Props) => {
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
    <AppBox as="li">
      <Tag
        tabIndex={0}
        ref={element}
        onClick={handler}
        color="gray.500"
        variant={value === selectValue ? 'blue' : undefined}
        css={styles}
        {...props}>
        {children}
      </Tag>
    </AppBox>
  );
};

InlineSelectChoice.displayName = 'InlineSelect.Choice';

export default InlineSelectChoice;
