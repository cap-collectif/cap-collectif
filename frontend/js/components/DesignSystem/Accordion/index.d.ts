// @ts-nocheck
import { PolymorphicComponent } from '~ui/Primitives/AppBox'

type Props = {
  readonly allowMultiple?: boolean
  readonly defaultAccordion?: string | string[]
}

declare const Accordion: PolymorphicComponent<Props>

export default Accordion
