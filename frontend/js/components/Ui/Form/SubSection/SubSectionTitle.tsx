import { $Values } from 'utility-types'
import * as React from 'react'
import { TitleSubSection, TitleQuestionnaire } from './SubSectionTitle.style'
import withColors from '../../../Utils/withColors'
import isQuestionnaire from '~/utils/isQuestionnaire'
import { TYPE_FORM } from '~/constants/FormConstants'

type SubSectionTitleProps = {
  children: JSX.Element | JSX.Element[] | string
  backgroundColor: string
  typeForm?: $Values<typeof TYPE_FORM>
}

const SubSectionTitle = ({ children, backgroundColor, typeForm }: SubSectionTitleProps) =>
  isQuestionnaire(typeForm) ? (
    <TitleQuestionnaire primaryColor={backgroundColor}>
      <p>{children}</p>
    </TitleQuestionnaire>
  ) : (
    <TitleSubSection primaryColor={backgroundColor}>{children}</TitleSubSection>
  )

export default withColors(SubSectionTitle)
