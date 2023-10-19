import { $Values } from 'utility-types'
import * as React from 'react'
import LabelContainer from './Label.style'
import { TYPE_FORM } from '~/constants/FormConstants'

type Props = {
  children?: JSX.Element | JSX.Element[] | string
  type?: 'radio' | 'checkbox' | 'radioButton' | 'label'
  hasImage?: boolean
  isChecked?: boolean
  htmlFor?: string
  className?: string
  id?: string
  typeForm?: $Values<typeof TYPE_FORM>
}

const Label = ({ children, className, type, hasImage = false, htmlFor, id, typeForm }: Props) => (
  <LabelContainer htmlFor={htmlFor} type={type} hasImage={hasImage} className={className} id={id} typeForm={typeForm}>
    {children}
  </LabelContainer>
)

export default Label
