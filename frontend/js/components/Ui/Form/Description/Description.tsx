import { $Values } from 'utility-types'
import * as React from 'react'
import DescriptionContainer from './Description.style'
import { TYPE_FORM } from '~/constants/FormConstants'
import isQuestionnaire from '~/utils/isQuestionnaire'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

type Props = {
  children: JSX.Element | JSX.Element[] | string
  typeForm?: $Values<typeof TYPE_FORM>
}

const Description = ({ children, typeForm }: Props) =>
  isQuestionnaire(typeForm) ? (
    <DescriptionContainer>
      {typeof children === 'string' ? <WYSIWYGRender value={children} /> : children}
    </DescriptionContainer>
  ) : typeof children === 'string' ? (
    <WYSIWYGRender value={children} />
  ) : (
    children
  )

export default Description
