import { AppBoxOwnProps, PolymorphicComponent } from './AppBox'

type Props = Omit<AppBoxOwnProps, 'size' | 'as'> & {
  readonly truncate?: number
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

declare const Heading: PolymorphicComponent<Props>

export default Heading
