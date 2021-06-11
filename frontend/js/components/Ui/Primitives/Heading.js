// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight, LineHeight } from '~ui/Primitives/constants';
import jsxInnerText from '~/utils/jsxInnerText';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  +truncate?: number,
|};

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

export const headingStyles = {
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
    lineHeight: LineHeight.SM,
  },
  h5: {
    fontSize: 1,
    fontWeight: FontWeight.Normal,
    lineHeight: LineHeight.SM,
    uppercase: true,
  },
};

// typings is handled by the .d.ts file
const Heading = React.forwardRef<Props, HTMLElement>(
  ({ children, truncate, as = 'h2', ...props }: Props, ref) => {
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
        fontSize={headingStyles[as] ? headingStyles[as].fontSize : 1}
        fontWeight={headingStyles[as] ? headingStyles[as].fontWeight : FontWeight.Normal}
        lineHeight={headingStyles[as] ? headingStyles[as].lineHeight : LineHeight.Base}
        m={0}
        {...(truncate && { title: innerText })}
        {...props}>
        {content}
      </AppBox>
    );
  },
);

Heading.displayName = 'Heading';

export default Heading;
