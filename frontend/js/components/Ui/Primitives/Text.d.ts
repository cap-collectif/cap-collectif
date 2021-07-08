import { PolymorphicComponent } from './AppBox'

export type TextProps = {
  readonly truncate?: number
}

declare const Text: PolymorphicComponent<TextProps>

export default Text
