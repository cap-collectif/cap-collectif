import * as React from 'react'
import type { FlexProps } from '~ui/Primitives/Layout/Flex'
import Flex from '~ui/Primitives/Layout/Flex'
import Title from './Title/Title'
import Description from './Description/Description'
export type SectionProps = FlexProps & {
  readonly children: JSX.Element | JSX.Element[] | string
}

const Section = ({ children, ...rest }: SectionProps) => (
  <Flex p={6} direction="column" bg="white" borderRadius="8px" {...rest}>
    {children}
  </Flex>
)

Section.Title = Title
Section.Description = Description
export default Section
