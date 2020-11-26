// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight, LineHeight } from '~ui/Primitives/constants';
import jsxInnerText from '~/utils/jsxInnerText';

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
  h1: {
    fontSize: 7,
    fontWeight: FontWeight.Semibold,
    lineHeight: LineHeight.XL,
  },
  h2: {
    fontSize: 6,
    fontWeight: FontWeight.Semibold,
    lineHeight: LineHeight.L,
  },
  h3: {
    fontSize: 5,
    fontWeight: FontWeight.Semibold,
    lineHeight: LineHeight.M,
  },
  h4: {
    fontSize: 4,
    fontWeight: FontWeight.Normal,
    lineHeight: LineHeight.S,
  },
  h5: {
    fontSize: 1,
    fontWeight: FontWeight.Normal,
    lineHeight: LineHeight.S,
  },
};

// typings is handled by the .d.ts file
const Heading: any = React.forwardRef(({ children, truncate, as = 'h2', ...rest }: any, ref) => {
  let content = children;
  const innerText = jsxInnerText(content);
  if (truncate && innerText.length > truncate) {
    content = `${innerText.slice(0, truncate)}…`;
  }
  return (
    <AppBox
      ref={ref}
      as={as}
      fontFamily="heading"
      fontSize={sizes[as] ? sizes[as].fontSize : 1}
      fontWeight={sizes[as] ? sizes[as].fontWeight : FontWeight.Normal}
      lineHeight={sizes[as] ? sizes[as].lineHeight : LineHeight.Base}
      m={0}
      {...(truncate ? { title: innerText } : {})}
      {...rest}>
      {content}
    </AppBox>
  );
});

Heading.displayName = 'Heading';

export default Heading;
