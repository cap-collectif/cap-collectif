// @ts-nocheck
import * as React from 'react'
import { Container } from './DebatePreviewList.style'
import type { Props as DebatePreviewItemProps } from '../DebatePreviewItem/DebatePreviewItem'
import DebatePreviewItem from '../DebatePreviewItem/DebatePreviewItem'

export type Props = {
  debates: Array<DebatePreviewItemProps>
  lang: string
  style?: Record<string, any>
}

const DebatePreviewList = ({ debates, lang, style }: Props) => (
  <Container style={style}>
    {debates.map((debate, idx) => (
      <DebatePreviewItem {...debate} lang={lang} key={`debate-preview-${idx}`} />
    ))}
  </Container>
)

export default DebatePreviewList
