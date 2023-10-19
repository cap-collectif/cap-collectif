import { $Values } from 'utility-types'
import * as React from 'react'
import cn from 'classnames'
import { HelpBlock } from 'react-bootstrap'
import { TYPE_FORM } from '~/constants/FormConstants'
import HelpContainer from './Help.style'
import isQuestionnaire from '~/utils/isQuestionnaire'

type Props = {
  children: JSX.Element | JSX.Element[] | string
  className?: string
  id?: string
  typeForm?: $Values<typeof TYPE_FORM>
}

const Help = ({ id, children, className, typeForm = TYPE_FORM.DEFAULT }: Props) =>
  isQuestionnaire(typeForm) ? (
    <HelpContainer className={cn(className)} id={id}>
      {children}
    </HelpContainer>
  ) : (
    <HelpBlock id={id ? `${id}-help` : ''}>{children}</HelpBlock>
  )

export default Help
