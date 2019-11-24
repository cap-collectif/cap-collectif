// @flow
import React, { type Node } from 'react';

import LinkToolbar from '../toolbar/LinkToolbar';
import { type DraftContentBlock } from '../models/types';

type Props = {
  contentState: DraftContentBlock,
  entityKey: string,
  children: Node,
};

/**
 * Custom component to render Link entity
 */
function Link(props: Props) {
  const { contentState, entityKey, children } = props;
  const entityData = contentState.getEntity(entityKey).getData();

  return (
    <LinkToolbar entityKey={entityKey} entityData={entityData}>
      <a href={entityData.href}>{children}</a>
    </LinkToolbar>
  );
}

export default Link;
