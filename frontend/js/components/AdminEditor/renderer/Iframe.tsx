// @ts-nocheck
import React from 'react'
import IframeToolbar from '../toolbar/IframeToolbar'
import type { DraftContentBlock, IframeEntityData, DraftTextDirection } from '../models/types'
import '../models/types'

type Props = IframeEntityData & {
  block: DraftContentBlock
  alignment: DraftTextDirection
}

/**
 * Custom component to render Iframe entity
 * e.g source:
 *   - https://www.youtube.com/embed/fnLxthCNQQY
 *   - https://www.dailymotion.com/embed/video/x7o5kox
 *   - https://player.vimeo.com/video/143512551
 */
export function Iframe({ block, alignment, ...rest }: Props) {
  const { src, title, width = '560', height = '315' } = rest
  // TODO: handle error case in editor
  if (!src) return null
  return (
    <IframeToolbar block={block} entityData={rest}>
      <div
        style={{
          textAlign: alignment,
        }}
      >
        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </IframeToolbar>
  )
}
export default Iframe
