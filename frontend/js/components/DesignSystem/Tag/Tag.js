// @flow
import * as React from 'react';
import { useState } from 'react';
import { variant } from 'styled-system';
import styled from 'styled-components';
import { AnimatePresence, m as motion } from 'framer-motion';
import css from '@styled-system/css';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import { ease } from '~/utils/motion';
import { Spacing } from '~ui/Primitives/constants';
import Text from '~ui/Primitives/Text';
import colors from '~/styles/modules/colors';
import jsxInnerText from '~/utils/jsxInnerText';
import type { AvatarProps } from '~ds/Avatar/Avatar';
import Avatar from '~ds/Avatar/Avatar';

export type Props = {|
  ...AppBoxProps,
  +icon?: $Values<typeof ICON_NAME>,
  +variantType?: 'tag' | 'badge',
  +avatar?: {| ...AvatarProps, props?: AppBoxProps |},
  +onRemove?: (e?: MouseEvent) => void,
  +variant?: 'blue' | 'aqua' | 'red' | 'green' | 'orange' | 'yellow' | 'gray' | 'neutral-gray',
|};

export const styles = {
  '& .icon': {
    color: 'inherit',
  },
};

const TagInner = styled(AppBox).attrs({
  maxHeight: Spacing.Xl,
  display: 'inline-flex',
  alignItems: 'center',
})(
  // $FlowFixMe flow types are wrong, it can also be a function which take the props and return an object
  ({ variantType }) => {
    return variant({
      variants: {
        blue: {
          bg: 'blue.150',
          '--current-shadow-color': colors.blue[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'blue.200' : undefined,
          },
          color: 'blue.800',
        },
        aqua: {
          bg: 'aqua.150',
          '--current-shadow-color': colors.aqua[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'aqua.200' : undefined,
          },
          color: 'aqua.800',
        },
        red: {
          bg: 'red.150',
          '--current-shadow-color': colors.red[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'red.200' : undefined,
          },
          color: 'red.800',
        },
        green: {
          bg: 'green.150',
          '--current-shadow-color': colors.green[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'green.200' : undefined,
          },
          color: 'green.800',
        },
        orange: {
          bg: 'orange.150',
          '--current-shadow-color': colors.orange[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'orange.200' : undefined,
          },
          color: 'orange.800',
        },
        yellow: {
          bg: 'yellow.150',
          '--current-shadow-color': colors.yellow[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'yellow.200' : undefined,
          },
          color: 'yellow.800',
        },
        gray: {
          bg: 'gray.150',
          '--current-shadow-color': colors.gray[200],
          '&:hover': {
            bg: variantType === 'tag' ? 'gray.200' : undefined,
          },
          color: 'gray.800',
        },
        'neutral-gray': {
          bg: 'neutral-gray.150',
          '--current-shadow-color': colors['neutral-gray'][200],
          '&:hover': {
            bg: variantType === 'tag' ? 'neutral-gray.200' : undefined,
          },
          color: 'neutral-gray.800',
        },
      },
    });
  },
  variant({
    prop: 'variantType',
    variants: {
      tag: {
        px: 2,
        fontSize: 2,
        py: 1,
        fontWeight: 400,
        fontFamily: 'roboto',
        maxWidth: '150px',
      },
      badge: {
        px: 4,
        fontSize: 1,
        py: 2,
        fontWeight: 600,
        fontFamily: 'openSans',
        textTransform: 'uppercase',
      },
    },
  }),
);

const IconContainer = motion.custom(AppBox);

const Tag = React.forwardRef<Props, HTMLSpanElement>(
  ({ children, icon, onRemove, avatar, variantType = 'tag', ...props }: Props, ref) => {
    const [state, set] = useState<'idle' | 'hovering'>('idle');
    const onFocus = () => {
      if (!onRemove) return;
      set('hovering');
    };
    return (
      <TagInner
        ref={ref}
        css={styles}
        variantType={variantType}
        title={jsxInnerText(children)}
        position="relative"
        borderRadius="tags"
        {...props}
        onMouseLeave={() => {
          set('idle');
        }}
        onMouseEnter={onFocus}
        onClick={onFocus}
        {...props}>
        {avatar && (avatar.src || avatar.name) && (
          <Avatar
            {...avatar.props}
            size="xs"
            mr={1}
            src={avatar.src}
            name={avatar.name}
            alt={avatar.alt}
          />
        )}
        {icon && <Icon name={icon} size="sm" mr={1} />}
        <Text
          lineHeight="sm"
          fontFamily="inherit"
          css={css({
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            paddingRight: state === 'hovering' ? (variantType === 'tag' ? '15%' : '1%') : undefined,
            textOverflow: 'ellipsis',
          })}>
          {children}
        </Text>
        {onRemove && (
          <AnimatePresence>
            {state === 'hovering' && (
              <IconContainer
                onClick={onRemove}
                ml={1}
                css={{ '&:hover': { cursor: 'pointer' } }}
                display="flex"
                bg="inherit"
                boxShadow="-5px 0 2px var(--current-shadow-color)"
                initial={{ opacity: 0, position: 'absolute', right: 0 }}
                animate={{ opacity: 1, position: 'absolute', right: Spacing.Xs2 }}
                transition={{ duration: 0.2, ease }}
                exit={{ opacity: 0, position: 'absolute', right: 0 }}>
                <Icon className="cross-icon" name={ICON_NAME.CROSS} color="inherit" size="xs" />
              </IconContainer>
            )}
          </AnimatePresence>
        )}
      </TagInner>
    );
  },
);

Tag.displayName = 'Tag';

export default Tag;
