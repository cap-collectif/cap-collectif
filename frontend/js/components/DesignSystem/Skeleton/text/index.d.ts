// @ts-nocheck
import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox'

type Props = {
  readonly size?: 'sm' | 'md' | 'lg'
  readonly animate?: boolean
}

declare const SkeletonText: PolymorphicComponent<Props>

export default SkeletonText
