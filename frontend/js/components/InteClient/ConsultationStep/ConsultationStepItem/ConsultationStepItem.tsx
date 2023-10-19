// @ts-nocheck
import * as React from 'react'
import type { Colors } from './ConsultationStepItem.style'
import { Container, Number } from './ConsultationStepItem.style'

export type Props = {
  number: string
  date: Record<string, string>
  title: Record<string, string>
  lang: string
  colors: Colors
}

const ConsultationStepItem = ({ number, date, title, lang, colors }: Props) => (
  <Container>
    <Number colors={colors}>
      {number}

      <span className="line" />
    </Number>

    <div>
      <p className="title">{title[lang]}</p>
      <p className="date">{date[lang]}</p>
    </div>
  </Container>
)

export default ConsultationStepItem
