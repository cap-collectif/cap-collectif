// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import { FontSize } from '~ui/Primitives/constants';

export const HeadingSize: {
  Xl: 'xl',
  Lg: 'lg',
  Md: 'md',
  Sm: 'sm',
  Xs: 'xs',
} = {
  Xl: 'xl',
  Lg: 'lg',
  Md: 'md',
  Sm: 'sm',
  Xs: 'xs',
};

const sizes = {
  xl: [FontSize.Xl3, null, FontSize.Xl4],
  lg: [FontSize.Xl, null, FontSize.Xl2],
  md: FontSize.Xl,
  sm: FontSize.Md,
  xs: FontSize.Sm,
};

// typings is handled by the .d.ts file
const Heading: any = React.forwardRef(({ children, size = 'xl', as = 'h2', ...rest }: any, ref) => {
  return (
    <AppBox
      ref={ref}
      lineHeight="shorter"
      fontWeight="bold"
      fontFamily="heading"
      as={as}
      fontSize={sizes[size]}
      {...rest}>
      {children}
    </AppBox>
  );
});

Heading.displayName = 'Heading';

export default Heading;
