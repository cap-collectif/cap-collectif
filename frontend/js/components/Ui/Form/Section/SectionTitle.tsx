import { $Values } from 'utility-types'
import * as React from 'react'
import styled from 'styled-components'
import withColors from '../../../Utils/withColors'
import { hexToRgba } from '~/utils/colors/hexToRgb'
import { TYPE_FORM } from '~/constants/FormConstants'
import TitleInvertContrast from '~ui/Typography/TitleInvertContrast'
import isQuestionnaire from '~/utils/isQuestionnaire'

type SectionTitleProps = {
  children: JSX.Element | JSX.Element[] | string
  backgroundColor: string
  typeForm?: $Values<typeof TYPE_FORM>
}
const Title = styled.h3<{
  primaryColor: string
}>`
  background-color: ${props =>
    props.primaryColor ? hexToRgba(props.primaryColor, 0.08, true) : hexToRgba('#fff', 0.08, true)};
  color: ${props => props.primaryColor || '#919191'};
  padding: 16px;
  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 32px 0;
`

const SectionTitle = ({ children, backgroundColor, typeForm }: SectionTitleProps) =>
  isQuestionnaire(typeForm) ? (
    <Title primaryColor={backgroundColor}>{children}</Title>
  ) : (
    <TitleInvertContrast>{children}</TitleInvertContrast>
  )

export default withColors(SectionTitle)
