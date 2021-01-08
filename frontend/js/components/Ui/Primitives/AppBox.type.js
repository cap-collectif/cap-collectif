// @flow
import type { Node } from 'react';
import type { CSSRules } from 'styled-components';

type NumberOrString = number | string;

export type Responsive<T> = T | T[] | {| [key: string]: T |};

export type ResponsiveBoolean = boolean | Array<boolean>;

type CustomStyled = {|
  +uppercase?: boolean,
|};

type Width = {|
  /** width */
  width?: Responsive<NumberOrString>,
  minWidth?: Responsive<NumberOrString>,
  w?: Responsive<NumberOrString>,
|};

type Height = {|
  /** height */
  height?: Responsive<NumberOrString>,
  minHeight?: Responsive<NumberOrString>,
  h?: Responsive<NumberOrString>,
|};

type Space = {|
  /** margin */
  m?: Responsive<NumberOrString>,
  margin?: Responsive<NumberOrString>,
  /** margin-top */
  mt?: Responsive<NumberOrString>,
  marginTop?: Responsive<NumberOrString>,
  /** margin-right */
  mr?: Responsive<NumberOrString>,
  marginRight?: Responsive<NumberOrString>,
  /** margin-bottom */
  mb?: Responsive<NumberOrString>,
  marginBottom?: Responsive<NumberOrString>,
  /** margin-left */
  ml?: Responsive<NumberOrString>,
  marginLeft?: Responsive<NumberOrString>,
  /** margin-x */
  mx?: Responsive<NumberOrString>,
  marginX?: Responsive<NumberOrString>,
  /** margin-y */
  my?: Responsive<NumberOrString>,
  marginY?: Responsive<NumberOrString>,
  /** padding */
  p?: Responsive<NumberOrString>,
  padding?: Responsive<NumberOrString>,
  /** padding-top */
  pt?: Responsive<NumberOrString>,
  paddingTop?: Responsive<NumberOrString>,
  /** padding-right */
  pr?: Responsive<NumberOrString>,
  paddingRight?: Responsive<NumberOrString>,
  /** padding-bottom */
  pb?: Responsive<NumberOrString>,
  paddingBottom?: Responsive<NumberOrString>,
  /** padding-left */
  pl?: Responsive<NumberOrString>,
  paddingLeft?: Responsive<NumberOrString>,
  /** padding-x */
  px?: Responsive<NumberOrString>,
  paddingX?: Responsive<NumberOrString>,
  /** padding-y */
  py?: Responsive<NumberOrString>,
  paddingY?: Responsive<NumberOrString>,
|};

type Position = {|
  /** top */
  top?: Responsive<NumberOrString>,
  /** left */
  left?: Responsive<NumberOrString>,
  /** right */
  right?: Responsive<NumberOrString>,
  /** bottom */
  bottom?: Responsive<NumberOrString>,
  /** bottom */
  position?: Responsive<string>,
|};

type Font = {|
  fontSize?: Responsive<NumberOrString>,
  f?: Responsive<NumberOrString>,
  fontFamily?: Responsive<string>,
  fontWeight?: Responsive<NumberOrString>,
|};

type Color = {|
  color?: Responsive<string>,
  /** background */
  bg?: Responsive<string>,
  backgroundColor?: Responsive<string>,
|};

type TextAlign = {|
  align?: Responsive<string>,
  textAlign?: Responsive<string>,
|};

type LineHeight = {|
  lineHeight?: NumberOrString,
|};

type AlignItems = {|
  alignItems?: Responsive<string>,
|};

type Justify = {|
  justifyContent?: Responsive<string>,
  justifyItems?: Responsive<string>,
  justifySelf?: Responsive<string>,
|};

type Align = {|
  alignContent?: Responsive<string>,
  alignItems?: Responsive<string>,
  alignSelf?: Responsive<string>,
|};

type Flex = {|
  ...Justify,
  ...Align,
  flex?: Responsive<string>,
  flexAlign?: Responsive<string>,
  flexJustify?: Responsive<string>,
  flexWrap?: Responsive<string>,
  flexDirection?: Responsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>,
  flexBasis?: Responsive<string>,
  flexGrow?: Responsive<number>,
  flexShrink?: Responsive<number>,
|};

type MaxWidth = {|
  maxWidth?: NumberOrString,
|};

type BorderRadius = {|
  borderRadius?: NumberOrString,
  borderTopRightRadius?: NumberOrString,
  borderTopLeftRadius?: NumberOrString,
  borderBottomLeftRadius?: NumberOrString,
  borderBottomRightRadius?: NumberOrString,
|};

type BorderWidth = {|
  borderWidth?: Responsive<NumberOrString>,
  borderTop?: Responsive<NumberOrString>,
  borderRight?: Responsive<NumberOrString>,
  borderBottom?: Responsive<NumberOrString>,
  borderLeft?: Responsive<NumberOrString>,
|};

type Border = {|
  border?: Responsive<NumberOrString>,
  borderColor?: Responsive<string>,
  borderStyle?: Responsive<
    | 'dashed'
    | 'dotted'
    | 'double'
    | 'groove'
    | 'hidden'
    | 'inset'
    | 'none'
    | 'outset'
    | 'ridge'
    | 'solid',
  >,
|};

type BoxShadow = {|
  boxShadow?: Responsive<NumberOrString>,
|};

type Overflow = {|
  overflow?: Responsive<string>,
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
  disabled?: boolean,
|};

type Visible = {|
  visible?: boolean,
|};

type Children = {|
  children?: Node,
|};

type Display = {|
  display?: Responsive<string>,
|};

type Size = {|
  size?: Responsive<string | number>,
  minSize?: Responsive<string | number>,
  maxSize?: Responsive<string | number>,
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
  css?: CSSRules | ((props: any) => Object) | Object,
|};

type HTML = {|
  id?: string,
  className?: string,
  src?: ?string,
  role?: string,
  type?: 'submit' | 'reset' | 'button',
  alt?: ?string,
  title?: ?string,
  dangerouslySetInnerHTML?: {| __html: any |},
|};

type onMouse = {|
  +onMouseOver?: Function,
  +onMouseEnter?: Function,
  +onMouseLeave?: Function,
  +onMouseOut?: Function,
|};

type onBlur = {|
  +onBlur?: Function,
|};

type onFocus = {|
  +onFocus?: Function,
|};

type onClick = {|
  +onClick?: Function,
|};

type As = {|
  as?: any,
|};

type Input = {|
  +checked?: boolean,
|};

type TabIndex = {|
  +tabIndex?: number,
|};

type Accessibility = {|
  +'aria-hidden'?: boolean,
  +'aria-label'?: string,
|};

type ZIndex = {| +zIndex?: number |};

export type AppBoxProps = {|
  ...Width,
  ...Size,
  ...Height,
  ...Space,
  ...Font,
  ...Position,
  ...Color,
  ...TextAlign,
  ...LineHeight,
  ...AlignItems,
  ...Flex,
  ...MaxWidth,
  ...BorderRadius,
  ...BorderWidth,
  ...Border,
  ...BoxShadow,
  ...Hover,
  ...Focus,
  ...Visible,
  ...Active,
  ...Disabled,
  ...Children,
  ...Display,
  ...Overflow,
  ...Grid,
  ...Css,
  ...HTML,
  ...onMouse,
  ...onBlur,
  ...onFocus,
  ...onClick,
  ...As,
  ...Input,
  ...CustomStyled,
  ...TabIndex,
  ...Accessibility,
  ...ZIndex,
|};
