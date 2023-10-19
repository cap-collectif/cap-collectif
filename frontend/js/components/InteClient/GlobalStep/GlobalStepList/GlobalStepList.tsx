// @ts-nocheck
import * as React from 'react'
import { Container } from './GlobalStepList.style'
import type { Props as GlobalItemProps } from '../GlobalStepItem/GlobalStepItem'
import GlobalStepItem from '../GlobalStepItem/GlobalStepItem'

export type Props = {
  steps: Array<GlobalItemProps>
  lang: string
  style?: Record<string, any>
}

const GlobalStepList = ({ steps, lang, style }: Props) => (
  <Container style={style}>
    {steps.map((step, idx) => (
      <GlobalStepItem {...step} key={`global-step-${idx}`} lang={lang} />
    ))}
  </Container>
)

export default GlobalStepList
