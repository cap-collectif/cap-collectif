// @flow
import React from 'react';

import {
  type DraftContentBlock,
  type DraftContentState,
  type DraftEntityType,
} from '../models/types';
import { IMAGE, IFRAME, HR } from './constants';
import Iframe from './Iframe';
import Image from './Image';

type Props = {
  block: DraftContentBlock,
  contentState: DraftContentState,
};

/**
 * Custom component to render block of atomic type
 *
 * WARNING: for this component and its children, don't put editorState from context here.
 * Otherwise you will provoke performance issue and you will make text edition very bad.
 */
function AtomicBlock(props: Props) {
  const { block, contentState } = props;
  const blockData = block.getData();
  const entityId = block.getEntityAt(0);
  const entity = contentState.getEntity(entityId);
  const type: DraftEntityType = entity.getType();
  const entityData = entity.getData();

  switch (type) {
    case IMAGE:
      return <Image block={block} alignment={blockData.alignment} {...entityData} />;
    case IFRAME:
      return <Iframe block={block} alignment={blockData.alignment} {...entityData} />;
    case HR:
      return <hr />;
    default:
      return null;
  }
}

export default AtomicBlock;
