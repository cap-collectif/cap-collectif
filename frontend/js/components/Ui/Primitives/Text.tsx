import * as React from 'react'
import AppBox, { PolymorphicBoxProps } from './AppBox'
import { LineHeight } from '~ui/Primitives/constants'
import jsxInnerText from '~/utils/jsxInnerText'
export type TextProps = PolymorphicBoxProps<React.ElementType> & {
  readonly truncate?: number
  readonly children?: any
}
// typings is handled by the .d.ts file
const Text: React.FC<TextProps> = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ truncate, children, ...props }: TextProps, ref): any => {
    let content = children
    const innerText = jsxInnerText(content)

    if (truncate && innerText.length > truncate) {
      content = `${innerText.slice(0, truncate)}…`
    }

    return (
      <AppBox
        ref={ref}
        as="p"
        fontFamily="body"
        lineHeight={LineHeight.Base}
        m={0}
        {...(truncate && {
          title: innerText,
        })}
        {...props}
      >
        {content}
      </AppBox>
    )
  },
)
Text.displayName = 'Text'
export default Text
