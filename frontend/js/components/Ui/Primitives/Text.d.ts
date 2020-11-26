import { PolymorphicComponent } from './AppBox'

type Props = {
  readonly truncate?: number
}

declare const Text: PolymorphicComponent<Props>

export default Text
