// @ts-nocheck
import * as React from 'react'
import { Container } from './ConsultationStepList.style'
import type { Props as ConsultationItemProps } from '../ConsultationStepItem/ConsultationStepItem'
import ConsultationStepItem from '../ConsultationStepItem/ConsultationStepItem'

export type Props = {
  steps: Array<ConsultationItemProps>
  lang: string
  columnHeight?: string
  style?: Record<string, any>
}

const ConsultationStepList = ({ steps, lang, style, columnHeight = '300px' }: Props) => (
  <Container style={style} columnHeight={columnHeight}>
    {steps.map((step, idx) => (
      <ConsultationStepItem {...step} key={`consultation-step-${idx}`} lang={lang} />
    ))}
  </Container>
)

export default ConsultationStepList
