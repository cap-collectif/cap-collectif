import * as React from 'react'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import '~ui/Primitives/AppBox.type'
import { Info } from './ProjectHeaderLegacy.Cover'
import Flex from '~ui/Primitives/Layout/Flex'

type Props = AppBoxProps & {
  children?: JSX.Element | JSX.Element[] | string
}

const ProjectHeaderLegacy = ({ children, ...rest }: Props) => {
  return (
    <Flex direction="column" className="projectHeader" maxWidth="100%" paddingY={[0, 9]} {...rest}>
      {children}
    </Flex>
  )
}

ProjectHeaderLegacy.Info = Info

export default ProjectHeaderLegacy
