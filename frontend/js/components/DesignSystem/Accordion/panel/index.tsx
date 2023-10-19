// @ts-nocheck
import * as React from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import type { FlexProps } from '~ui/Primitives/Layout/Flex'
import Flex from '~ui/Primitives/Layout/Flex'
import { AccordionItemContext } from '~ds/Accordion/item/context'

type Props = FlexProps & {
  children: JSX.Element | JSX.Element[] | string
}
const Container = motion(Flex)

const AccordionPanel = ({ children, ...props }: Props) => {
  const { open } = React.useContext(AccordionItemContext)
  return (
    <AnimatePresence exitBeforeEnter>
      {open && (
        <Container
          direction="column"
          px={8}
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: {
              opacity: 1,
              height: 'auto',
            },
            collapsed: {
              opacity: 0,
              height: 0,
            },
          }}
          transition={{
            duration: 0.5,
            ease: [0.04, 0.62, 0.23, 0.98],
          }}
          {...props}
        >
          {children}
        </Container>
      )}
    </AnimatePresence>
  )
}

export default AccordionPanel
