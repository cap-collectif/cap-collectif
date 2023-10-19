import { CSSRules } from 'styled-components'
type NumberOrString = number | string
export type Responsive<T> = T | T[] | Record<string, T>
export type ResponsiveBoolean = boolean | Array<boolean>
type CustomStyled = {
  readonly uppercase?: boolean
  readonly capitalize?: boolean
}
type LinkProps = {
  readonly href?: string
}
type Width = {
  /** width */
  width?: Responsive<NumberOrString>
  minWidth?: Responsive<NumberOrString>
  w?: Responsive<NumberOrString>
}
type Height = {
  /** height */
  height?: Responsive<NumberOrString>
  minHeight?: Responsive<NumberOrString>
  h?: Responsive<NumberOrString>
}
type Space = {
  /** margin */
  m?: Responsive<NumberOrString>
  margin?: Responsive<NumberOrString>

  /** margin-top */
  mt?: Responsive<NumberOrString>
  marginTop?: Responsive<NumberOrString>

  /** margin-right */
  mr?: Responsive<NumberOrString>
  marginRight?: Responsive<NumberOrString>

  /** margin-bottom */
  mb?: Responsive<NumberOrString>
  marginBottom?: Responsive<NumberOrString>

  /** margin-left */
  ml?: Responsive<NumberOrString>
  marginLeft?: Responsive<NumberOrString>

  /** margin-x */
  mx?: Responsive<NumberOrString>
  marginX?: Responsive<NumberOrString>

  /** margin-y */
  my?: Responsive<NumberOrString>
  marginY?: Responsive<NumberOrString>

  /** padding */
  p?: Responsive<NumberOrString>
  padding?: Responsive<NumberOrString>

  /** padding-top */
  pt?: Responsive<NumberOrString>
  paddingTop?: Responsive<NumberOrString>

  /** padding-right */
  pr?: Responsive<NumberOrString>
  paddingRight?: Responsive<NumberOrString>

  /** padding-bottom */
  pb?: Responsive<NumberOrString>
  paddingBottom?: Responsive<NumberOrString>

  /** padding-left */
  pl?: Responsive<NumberOrString>
  paddingLeft?: Responsive<NumberOrString>

  /** padding-x */
  px?: Responsive<NumberOrString>
  paddingX?: Responsive<NumberOrString>

  /** padding-y */
  py?: Responsive<NumberOrString>
  paddingY?: Responsive<NumberOrString>
}
type Position = {
  /** top */
  top?: Responsive<NumberOrString>

  /** left */
  left?: Responsive<NumberOrString>

  /** right */
  right?: Responsive<NumberOrString>

  /** bottom */
  bottom?: Responsive<NumberOrString>

  /** bottom */
  position?: Responsive<string>
}
type Font = {
  fontSize?: Responsive<NumberOrString>
  f?: Responsive<NumberOrString>
  fontFamily?: Responsive<string>
  fontWeight?: Responsive<NumberOrString>
}
type Color = {
  color?: Responsive<string>
  bg?: Responsive<string>
  backgroundColor?: Responsive<string>
}
type TextAlign = {
  align?: Responsive<string>
  textAlign?: Responsive<string>
}
type VerticalAlign = {
  verticalAlign?: Responsive<string>
}
type TextOverflow = {
  textOverflow?: Responsive<string>
}
type LineHeight = {
  lineHeight?: NumberOrString
}
type Justify = {
  justifyContent?: Responsive<string>
  justifyItems?: Responsive<string>
  justifySelf?: Responsive<string>
}
type Align = {
  alignContent?: Responsive<string>
  alignItems?: Responsive<string>
  alignSelf?: Responsive<string>
}
type Flex = Justify &
  Align & {
    flex?: Responsive<NumberOrString>
    flexAlign?: Responsive<string>
    flexJustify?: Responsive<string>
    flexWrap?: Responsive<string>
    flexDirection?: Responsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>
    flexBasis?: Responsive<string>
    flexGrow?: Responsive<number>
    flexShrink?: Responsive<number>
  }
type MaxWidth = {
  maxWidth?: Responsive<NumberOrString>
}
type MaxHeight = {
  maxHeight?: Responsive<NumberOrString>
}
type BorderRadius = {
  borderRadius?: Responsive<NumberOrString>
  borderTopRightRadius?: Responsive<NumberOrString>
  borderTopLeftRadius?: Responsive<NumberOrString>
  borderBottomLeftRadius?: Responsive<NumberOrString>
  borderBottomRightRadius?: Responsive<NumberOrString>
}
type BorderWidth = {
  borderWidth?: Responsive<NumberOrString>
  borderTop?: Responsive<NumberOrString>
  borderRight?: Responsive<NumberOrString>
  borderBottom?: Responsive<NumberOrString>
  borderLeft?: Responsive<NumberOrString>
}
type Border = {
  border?: Responsive<NumberOrString>
  borderColor?: Responsive<string>
  borderStyle?: Responsive<
    'dashed' | 'dotted' | 'double' | 'groove' | 'hidden' | 'inset' | 'none' | 'outset' | 'ridge' | 'solid'
  >
}
type BoxShadow = {
  boxShadow?: Responsive<NumberOrString>
}
type Overflow = {
  overflow?: Responsive<string>
  overflowX?: Responsive<string>
  overflowY?: Responsive<string>
}
type Hover = {
  hover?: Record<string, any>
}
type Focus = {
  focus?: Record<string, any>
}
type Active = {
  active?: Record<string, any>
}
type Disabled = {
  disabledStyle?: Record<string, any>
  disabled?: boolean
}
type Visible = {
  visible?: boolean
}
type Display = {
  display?: Responsive<string>
}
type Size = {
  size?: Responsive<string | number>
  minSize?: Responsive<string | number>
  maxSize?: Responsive<string | number>
}
type Grid = {
  gridTemplateColumns?: Responsive<NumberOrString>
  gridGap?: Responsive<NumberOrString>
  gridRowGap?: Responsive<NumberOrString>
  gridColumnGap?: Responsive<NumberOrString>
  gridAutoFlow?: Responsive<NumberOrString>
  gridAutoRows?: Responsive<NumberOrString>
  gridAutoColumns?: Responsive<NumberOrString>
  gridTemplateRows?: Responsive<NumberOrString>
  gridTemplateAreas?: Responsive<NumberOrString>
  gridArea?: Responsive<NumberOrString>
  gridColumn?: Responsive<NumberOrString>
  gridRow?: Responsive<NumberOrString>
}
type Css = {
  css?: CSSRules | ((props: any) => Record<string, any>) | Record<string, any>
  style?: CSSRules | Record<string, any>
}
type HTML = {
  id?: string
  className?: string
  src?: string | null | undefined
  srcSet?: string | null | undefined
  sizes?: string | null | undefined
  loading?: 'eager' | 'lazy'
  role?: string
  type?: 'submit' | 'reset' | 'button'
  alt?: string | null | undefined
  title?: string | null | undefined
  'data-type'?: string | null | undefined
  dangerouslySetInnerHTML?: {
    __html: any
  }
}
type onMouse = {
  readonly onMouseOver?: (...args: Array<any>) => any
  readonly onMouseEnter?: (...args: Array<any>) => any
  readonly onMouseLeave?: (...args: Array<any>) => any
  readonly onMouseOut?: (...args: Array<any>) => any
}
type onBlur = {
  readonly onBlur?: (...args: Array<any>) => any
}
type onFocus = {
  readonly onFocus?: (...args: Array<any>) => any
}
type onClick = {
  readonly onClick?: (...args: Array<any>) => any
}
type As = {
  as?: any
}
type Anchor = {
  download?: boolean
  target?: string
}
type Input = {
  readonly checked?: boolean
}
type Accessibility = {
  readonly 'aria-hidden'?: boolean
  readonly 'aria-label'?: string
  readonly ariaLabel?: string
  readonly ariaLabelledby?: string
  readonly 'aria-labelledby'?: string
  readonly tabIndex?: number
}
type ZIndex = {
  readonly zIndex?: number
}
type Opacity = {
  readonly opacity?: Responsive<NumberOrString>
}
type Clip = {
  readonly clip?: string
}
type WhiteSpace = {
  readonly whiteSpace?: string
}
type Table = {
  readonly colSpan?: string
}
type Cursor = {
  cursor?: 'pointer' | 'normal'
}
type ObjectFit = {
  objectFit?: 'cover' | 'contains' | 'fills' | 'none' | 'scale-down' | 'inherit' | 'initial' | 'revert' | 'unset'
}
export type AppBoxProps = Width &
  Size &
  Height &
  Space &
  Font &
  Position &
  Color &
  TextAlign &
  VerticalAlign &
  TextOverflow &
  LineHeight &
  Flex &
  MaxWidth &
  MaxHeight &
  BorderRadius &
  BorderWidth &
  Border &
  BoxShadow &
  Hover &
  Focus &
  Visible &
  Active &
  Disabled &
  Display &
  Overflow &
  Grid &
  Css &
  HTML &
  onMouse &
  onBlur &
  onFocus &
  onClick &
  As &
  Anchor &
  Input &
  CustomStyled &
  Accessibility &
  ZIndex &
  LinkProps &
  Opacity &
  Clip &
  WhiteSpace &
  Table &
  Cursor &
  ObjectFit
