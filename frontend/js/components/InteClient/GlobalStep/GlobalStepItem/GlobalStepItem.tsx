// @ts-nocheck
import * as React from 'react'
import type { Colors } from './GlobalStepItem.style'
import { Container } from './GlobalStepItem.style'

export type Props = {
  title: Record<string, string>
  subtitle: Record<string, string>
  description: Record<string, string>
  lang: string
  colors: Colors
}

const GlobalStepItem = ({ title, subtitle, description, lang, colors }: Props) => (
  <Container lineColor={colors.line}>
    <div>
      <span className="title">{title[lang]}</span>
      <br />
      <span className="subtitle">{subtitle[lang]}</span>
      <span className="line" />
    </div>

    <p className="description">{description[lang]}</p>
  </Container>
)

export default GlobalStepItem
