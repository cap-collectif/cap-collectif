// @flow
import * as React from 'react';
import css from '@styled-system/css';
import AppBox from '~ui/Primitives/AppBox';
import { SPACES_SCALES } from '~/styles/theme/base';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { useListOptionGroup } from '~ds/List/ListOptionGroup.context';
import Text from '~ui/Primitives/Text';
import { LineHeight } from '~ui/Primitives/constants';

type Props = {|
  ...AppBoxProps,
  +value: string,
  +disabled?: boolean,
  +children?: React$Node,
|};

const ListOptionGroupItem = ({ children, value, ...props }: Props) => {
  const { type, onChange, value: originalValue } = useListOptionGroup();
  const isSelected = Array.isArray(originalValue)
    ? originalValue.includes(value)
    : originalValue === value;
  return (
    <AppBox
      display="flex"
      flexDirection="row"
      px={3}
      py={2}
      alignItems="center"
      lineHeight="base"
      css={{
        '&:hover': {
          cursor: 'pointer',
        },
      }}
      {...props}
      onClick={() => {
        if (onChange) {
          if (Array.isArray(originalValue)) {
            onChange(
              isSelected ? originalValue.filter(v => v !== value) : [...originalValue, value],
            );
          } else {
            onChange(value);
          }
        }
      }}>
      <AppBox
        display="inline-block"
        as="input"
        lineHeight={LineHeight.Base}
        checked={isSelected}
        css={css({
          pointerEvents: 'none',
          mt: '0 !important',
          mr: `${SPACES_SCALES[2]} !important`,
        })}
        type={type}
      />
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </AppBox>
  );
};

ListOptionGroupItem.displayName = 'ListOptionGroup.Item';

export default ListOptionGroupItem;
