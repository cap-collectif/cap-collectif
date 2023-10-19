// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/DebatePreview/DebatePreviewList/DebatePreviewList'
import DebatePreviewList from '~/components/InteClient/DebatePreview/DebatePreviewList/DebatePreviewList'

export default (props: Props) => (
  <Providers>
    <DebatePreviewList {...props} />
  </Providers>
)
