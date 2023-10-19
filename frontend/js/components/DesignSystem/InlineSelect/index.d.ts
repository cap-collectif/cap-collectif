// @ts-nocheck
import { PolymorphicComponent } from '~ui/Primitives/AppBox'

type Props = {
  readonly value?: string | null
  readonly onChange?: (value: string) => void
}

declare const InlineSelect: PolymorphicComponent<Props>

export default InlineSelect
