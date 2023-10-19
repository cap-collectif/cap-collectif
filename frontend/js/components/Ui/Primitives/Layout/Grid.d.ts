// adapted from https://github.com/chakra-ui/chakra-ui/blob/fd75ad9f4aa570184ea88ea6ff0f99ad0d6fb818/packages/layout/src/grid.tsx
import { AppBoxOwnProps } from '../AppBox'
import { GridProps } from 'styled-system'
import { FC } from 'react'

type AutoFillFitOptions = {
  min: string
  max: string
}

export interface GridOptions {
  templateColumns?: GridProps['gridTemplateColumns']
  gap?: GridProps['gridGap']
  rowGap?: GridProps['gridRowGap']
  columnGap?: GridProps['gridColumnGap']
  autoFlow?: GridProps['gridAutoFlow']
  autoRows?: GridProps['gridAutoRows']
  autoColumns?: GridProps['gridAutoColumns']
  templateRows?: GridProps['gridTemplateRows']
  templateAreas?: GridProps['gridTemplateAreas']
  area?: GridProps['gridArea']
  column?: GridProps['gridColumn']
  row?: GridProps['gridRow']
  autoFit?: AutoFillFitOptions | boolean
  autoFill?: AutoFillFitOptions | boolean
}

type Props = Omit<
  AppBoxOwnProps,
  | 'templateColumns'
  | 'gap'
  | 'rowGap'
  | 'columnGap'
  | 'autoFlow'
  | 'autoRows'
  | 'autoColumns'
  | 'templateRows'
  | 'templateAreas'
  | 'area'
  | 'column'
  | 'row'
> &
  GridOptions

declare const Grid: FC<Props>

export default Grid
