import {
    BorderProps,
    ColorProps,
    FlexboxProps,
    FontSizeProps,
    FontWeightProps,
    GridProps,
    LayoutProps,
    LetterSpacingProps,
    LineHeightProps,
    PositionProps,
    ResponsiveValue,
    ShadowProps,
    SpaceProps,
    TypographyProps
} from 'styled-system'
import type {HTMLAttributes, RefAttributes} from 'react'
import {css} from 'styled-components'

type AppBoxHTMLProps = RefAttributes<any> & HTMLAttributes<any>

type FontSizeValues = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

interface AppFontSize {
    fontSize?: FontSizeValues | ResponsiveValue<FontSizeValues> | FontSizeProps['fontSize']
}

type FontWeightValues =
    | 'hairline'
    | 'thin'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black'

interface AppFontWeight {
    fontWeight?:
        | FontWeightValues
        | ResponsiveValue<FontWeightValues>
        | FontWeightProps['fontWeight']
}

type LineHeightValues = 'normal' | 'none' | 'shorter' | 'short' | 'base' | 'tall' | 'taller'

interface AppLineHeight {
    lineHeight?:
        | LineHeightValues
        | ResponsiveValue<LineHeightValues>
        | LineHeightProps['lineHeight']
}

type LetterSpacingValues = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest'


interface AppLetterSpacing {
    letterSpacing?:
        | LetterSpacingValues
        | ResponsiveValue<LetterSpacingValues>
        | LetterSpacingProps['letterSpacing']
}

type AppTypographyProps = Omit<TypographyProps, 'fontWeight' | 'lineHeight' | 'fontSize' | 'letterSpacing'>

type StyledSystemProps = ColorProps &
    ShadowProps &
    SpaceProps &
    LayoutProps &
    FlexboxProps &
    GridProps &
    BorderProps &
    PositionProps &
    AppTypographyProps

type ModifiedStyledSystemProps = AppFontSize & AppLetterSpacing & AppFontWeight & AppLineHeight

interface CustomBoxProps {
    readonly uppercase?: boolean
    readonly css?:
        | ((props: { theme: any } & Record<string, any>) => Record<string, unknown>)
        | ReturnType<typeof css>
        | Record<string, unknown>
    readonly ref?: any
}

export type AppBoxProps = AppBoxHTMLProps & CustomBoxProps & StyledSystemProps & ModifiedStyledSystemProps

type PropsOf<E extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = JSX.LibraryManagedAttributes<E,
    React.ComponentPropsWithRef<E>>

export interface AppBoxOwnProps<E extends React.ElementType = React.ElementType> extends AppBoxProps {
    as?: E
}

export type PolymorphicBoxProps<E extends React.ElementType> = AppBoxOwnProps<E> &
    Omit<PropsOf<E>, keyof AppBoxOwnProps>

export type PolymorphicComponentProps<E extends React.ElementType, P> = P & PolymorphicBoxProps<E>

declare const defaultElement = 'div'

export type PolymorphicAppBox = <E extends React.ElementType = typeof defaultElement>(
    props: PolymorphicBoxProps<E>
) => JSX.Element

export type PolymorphicComponent<P> = <E extends React.ElementType = typeof defaultElement>(
    props: PolymorphicComponentProps<E, P>
) => JSX.Element

declare const AppBox: PolymorphicAppBox


export default AppBox
