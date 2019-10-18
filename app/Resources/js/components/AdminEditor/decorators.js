// @flow
import { CompositeDecorator } from 'draft-js';

import Link from './renderer/Link';

export const linkStrategy = (contentBlock: Object, callback: Function, contentState: Object) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
  }, callback);
};

const compositeDecorator = new CompositeDecorator([
  {
    strategy: linkStrategy,
    component: Link,
  },
]);

export default compositeDecorator;
