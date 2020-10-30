import { AppBoxOwnProps, PolymorphicComponent } from './AppBox'
import { HeadingSize } from './constants'

type Size = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

type Props = Omit<AppBoxOwnProps, 'size' | 'as'> & {
    readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    readonly size?: typeof HeadingSize | Size
}

declare const Heading: PolymorphicComponent<Props>

export default Heading
