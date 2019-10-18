// @flow
import React from 'react';

import MediaToolbar from '../toolbar/MediaToolbar';

type Props = {
  block: Object,
  src: string,
  title: string,
  description?: string,
  width?: number,
  height?: number,
};

/**
 * Custom component to render Iframe entity
 * e.g source: https://www.youtube.com/embed/fnLxthCNQQY
 */
export function Iframe({ block, src, description, width = '560', height = '315' }: Props) {
  // TODO: handle error case in editor
  if (!src) return null;

  return (
    <MediaToolbar block={block}>
      <iframe
        width={width}
        height={height}
        src={src}
        title={description}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </MediaToolbar>
  );
}

export default Iframe;
