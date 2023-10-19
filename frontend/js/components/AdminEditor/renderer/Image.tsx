// @ts-nocheck
import React from 'react'
import ImageToolbar from '../toolbar/ImageToolbar'
import type { DraftContentBlock, ImageEntityData, DraftTextDirection } from '../models/types'
import '../models/types'

type Props = ImageEntityData & {
  block: DraftContentBlock
  alignment: DraftTextDirection
}

/**
 * Custom component to render Image entity
 * e.g source : https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80
 */
export function Image({ block, alignment, ...rest }: Props) {
  const { src, alt = '', width, height, border, marginX, marginY } = rest
  // TODO: handle error case in editor
  if (!src) return null
  return (
    <ImageToolbar block={block} entityData={rest}>
      <div
        style={{
          textAlign: alignment,
        }}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            maxWidth: '100%',
            borderWidth: parseInt(border, 10) || 0,
            borderStyle: 'solid',
            marginLeft: parseInt(marginX, 10) || 0,
            marginRight: parseInt(marginX, 10) || 0,
            marginTop: parseInt(marginY, 10) || 0,
            marginBottom: parseInt(marginY, 10) || 0,
          }}
        />
      </div>
    </ImageToolbar>
  )
}
export default Image
