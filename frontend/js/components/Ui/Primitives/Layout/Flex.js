// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import useTheme from '~/utils/hooks/useTheme';

// typings is handled by the .d.ts file
const Flex: any = React.forwardRef((props: any, ref) => {
  const { direction, align, justify, wrap, basis, grow, spacing: userSpacing, ...rest } = props;
  const theme = useTheme();
  const spacing = theme.space[userSpacing] ?? userSpacing;
  const styles = {
    ...(spacing
      ? {
          '& > *': {
            ...(typeof direction === 'string' &&
              direction === 'row' && { marginLeft: spacing }: any),
            ...(typeof direction === 'string' &&
              direction === 'column' && { marginTop: spacing }: any),
            // While `gap` for flex is not supported by a mojority of browser,
            // we prefer this approach to have a broader compatibility, and also to support
            // responsive values 🔥🥵🔥
            ...(Array.isArray(direction) &&
              direction.reduce(
                (acc, value, index) => {
                  return {
                    ...acc,
                    [`@media screen and (min-width: ${theme.breakpoints[index]})`]: {
                      ...((direction[index + 1] ?? 'row') === 'row'
                        ? { marginLeft: spacing, marginTop: 0 }
                        : { marginTop: spacing, marginLeft: 0 }),
                    },
                  };
                },
                {
                  ...(direction[0] === 'row' && { marginLeft: spacing, marginTop: 0 }),
                  ...(direction[0] === 'column' &&
                    ({
                      marginTop: spacing,
                      marginLeft: 0,
                    }: any)),
                },
              )),
            '&:first-of-type': {
              marginLeft: 0,
              marginTop: 0,
            },
          },
        }
      : {}),
  };

  return (
    <AppBox
      display="flex"
      flexDirection={direction}
      alignItems={align}
      justifyContent={justify}
      flexWrap={wrap}
      flexBasis={basis}
      flexGrow={grow}
      ref={ref}
      css={styles}
      {...rest}
    />
  );
});

export default Flex;
