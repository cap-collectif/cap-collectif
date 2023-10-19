// @ts-nocheck
import * as React from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import PopoverHeader from '../header'
import PopoverBody from '../body'
import PopoverFooter from '../footer'
import type { FlexProps } from '~ui/Primitives/Layout/Flex'

export const POPOVER_CONTENT_TYPE: 'PopoverContent' = 'PopoverContent'
type Props = FlexProps & {
  children:
    | React.ChildrenArray<
        | React.ReactElement<typeof PopoverHeader>
        | React.ReactElement<typeof PopoverBody>
        | React.ReactElement<typeof PopoverFooter>
      >
    | ((render: { closePopover?: () => void }) => React.ReactElement<typeof React.ReactFragment>)
  closePopover?: () => void
}
const PopoverContent = React.forwardRef<HTMLElement, Props>(({ children, closePopover, ...props }: Props, ref) => (
  <Flex
    direction="column"
    p={4}
    bg="white"
    color="gray.900"
    borderRadius="popover"
    boxShadow="medium"
    width="350px"
    maxWidth="350px"
    ref={ref}
    {...props}
  >
    {typeof children === 'function'
      ? children({
          closePopover,
        })
      : children}
  </Flex>
))
PopoverContent.name = POPOVER_CONTENT_TYPE
PopoverContent.displayName = 'Popover.Content'
export default PopoverContent
