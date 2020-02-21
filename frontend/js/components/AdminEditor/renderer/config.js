// @flow
import { getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';

import AtomicBlock from './AtomicBlock';
import { colorStyleMap, bgStyleMap } from '../colors';
import { Table } from './Table';

const getBlockRendererFn = (editor: Object) => (contentBlock: Object) => {
  if (contentBlock.type === 'table') {
    return {
      component: Table,
      props: {
        editor,
      },
      editable: true,
    };
  }
  if (contentBlock.getType() !== 'atomic') return null;

  // It's possible to pass props here
  return {
    component: AtomicBlock,
    editable: false,
  };
};

function blockStyleFn(block: Object): string {
  const blockAlignment = block.getData() && block.getData().get('alignment');

  if (blockAlignment) {
    return `block-align-${blockAlignment}`;
  }

  return '';
}

function keyBindingFn(event: SyntheticKeyboardEvent<>): ?string {
  // Insert link : CMD + K
  if (event.keyCode === 75 && KeyBindingUtil.hasCommandModifier(event)) {
    return 'insert-link';
  }

  // Add CMD + Y
  if (event.keyCode === 89 && KeyBindingUtil.hasCommandModifier(event)) {
    return 'redo';
  }

  if (event.metaKey && event.shiftKey && event.keyCode === 13) {
    return 'insert-new-softline';
  }

  return getDefaultKeyBinding(event);
}

export default {
  keyBindingFn,
  getBlockRendererFn,
  blockStyleFn,
  // TODO: maybe use customStyleFn for more dynamic style applying
  customStyleMap: {
    ...colorStyleMap,
    ...bgStyleMap,
  },
};
