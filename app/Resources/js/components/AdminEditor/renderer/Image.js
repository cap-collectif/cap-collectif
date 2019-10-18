// @flow
import React from 'react';

import MediaToolbar from '../toolbar/MediaToolbar';

type Props = {
  block: Object,
  src: string,
  alt: string,
  width?: number | string,
  height?: number | string,
};

/**
 * Custom component to render Image entity
 */
export function Image({ block, src, alt = '', width = '100%', height }: Props) {
  // TODO: handle error case in editor
  if (!src) return null;

  return (
    <MediaToolbar block={block}>
      <img src={src} alt={alt} width={width} height={height} />
    </MediaToolbar>
  );
}

export default Image;
