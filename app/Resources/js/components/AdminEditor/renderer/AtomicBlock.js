// @flow
import React from 'react';

import Iframe from './Iframe';
import Image from './Image';

type Props = {
  block: Object,
  contentState: Object,
};

/**
 * Custom component to render block of atomic type
 */
function AtomicBlock({ block, contentState }: Props) {
  const entityId = block.getEntityAt(0);
  const entity = contentState.getEntity(entityId);
  const type = entity.getType();
  const data = entity.getData();

  switch (type) {
    case 'IMAGE':
      return <Image block={block} {...data} />;
    case 'IFRAME':
      return <Iframe block={block} {...data} />;
    case 'HR':
      return <hr />;
    default:
      return null;
  }
}

export default AtomicBlock;
