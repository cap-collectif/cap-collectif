// @flow
import type { Node } from 'react';
import type { CSSRules } from 'styled-components';

type NumberOrString = number | string;

type Responsive<T> = T | T[] | {| [key: string]: T |};

type ResponsiveBoolean = boolean | Array<boolean>;

type Width = {|
  /** width */
  width?: Responsive<NumberOrString>,
  /** width */
  w?: Responsive<NumberOrString>,
|};

type Height = {|
  /** height */
  height?: Responsive<NumberOrString>,
  /** height */
  h?: Responsive<NumberOrString>,
|};

type Space = {|
  /** margin */
  m?: Responsive<NumberOrString>,
  /** margin-top */
  mt?: Responsive<NumberOrString>,
  /** margin-right */
  mr?: Responsive<NumberOrString>,
  /** margin-bottom */
  mb?: Responsive<NumberOrString>,
  /** margin-left */
  ml?: Responsive<NumberOrString>,
  /** margin-x */
  mx?: Responsive<NumberOrString>,
  /** margin-y */
  my?: Responsive<NumberOrString>,
  /** padding */
  p?: Responsive<NumberOrString>,
  /** padding-top */
  pt?: Responsive<NumberOrString>,
  /** padding-right */
  pr?: Responsive<NumberOrString>,
  /** padding-bottom */
  pb?: Responsive<NumberOrString>,
  /** padding-left */
  pl?: Responsive<NumberOrString>,
  /** padding-x */
  px?: Responsive<NumberOrString>,
  /** padding-y */
  py?: Responsive<NumberOrString>,
|};

type FontSize = {|
  /** fontSize */
  fontSize?: Responsive<string>,
  /** fontSize */
  f?: Responsive<string>,
|};

type Color = {|
  color?: Responsive<string>,
  /** background */
  bg?: Responsive<string>,
|};

type TextAlign = {|
  align?: Responsive<string>,
|};

type FontWeight = {|
  fontWeight?: NumberOrString,
|};

type LineHeight = {|
  lineHeight?: NumberOrString,
|};

type AlignItems = {|
  align?: Responsive<string>,
|};

type JustifyContent = {|
  justify?: Responsive<string>,
|};

type FlexWrap = {|
  wrap?: ResponsiveBoolean,
|};

type FlexDirection = {|
  flexDirection?: Responsive<string>,
|};

type Flex = {|
  flex?: Responsive<string>,
|};

type AlignSelf = {|
  alignSelf?: Responsive<string>,
|};

type MaxWidth = {|
  maxWidth?: NumberOrString,
|};

type BorderRadius = {|
  borderRadius?: NumberOrString,
|};

type BorderWidth = {|
  borderWidth?: NumberOrString,
  borderTop?: boolean,
  borderRight?: boolean,
  borderBottom?: boolean,
  borderLeft?: boolean,
|};

type BorderColor = {|
  borderColor?: string,
|};

type BoxShadow = {|
  boxShadow?: NumberOrString,
|};

type Hover = {|
  hover?: Object,
|};

type Focus = {|
  focus?: Object,
|};

type Active = {|
  active?: Object,
|};

type Disabled = {|
  disabledStyle?: Object,
|};

type Children = {|
  children?: Node,
|};

type Display = {|
  display?: Responsive<string>,
|};

type Grid = {|
  gridTemplateColumns?: Responsive<NumberOrString>,
  gridGap?: Responsive<NumberOrString>,
  gridRowGap?: Responsive<NumberOrString>,
  gridColumnGap?: Responsive<NumberOrString>,
  gridAutoFlow?: Responsive<NumberOrString>,
  gridAutoRows?: Responsive<NumberOrString>,
  gridAutoColumns?: Responsive<NumberOrString>,
  gridTemplateRows?: Responsive<NumberOrString>,
  gridTemplateAreas?: Responsive<NumberOrString>,
  gridArea?: Responsive<NumberOrString>,
  gridColumn?: Responsive<NumberOrString>,
  gridRow?: Responsive<NumberOrString>,
|};

type Css = {|
  css?: CSSRules | ((props: any) => Object),
|};

type onMouseOver = Function;
type onMouseLeave = Function;
type onBlur = Function;
type onFocus = Function;

type As = {|
  as: string,
|};

export type AppBoxProps = {|
  ...Width,
  ...Height,
  ...Space,
  ...FontSize,
  ...Color,
  ...TextAlign,
  ...FontWeight,
  ...LineHeight,
  ...AlignItems,
  ...JustifyContent,
  ...FlexWrap,
  ...FlexDirection,
  ...Flex,
  ...AlignSelf,
  ...MaxWidth,
  ...BorderRadius,
  ...BorderWidth,
  ...BorderColor,
  ...BoxShadow,
  ...Hover,
  ...Focus,
  ...Active,
  ...Disabled,
  ...Children,
  ...Display,
  ...Grid,
  ...Css,
  ...onMouseOver,
  ...onMouseLeave,
  ...onBlur,
  ...onFocus,
  ...As,
|};
