// @flow
import React from 'react';
import { createPortal } from 'react-dom';
import { camelCase } from 'lodash';
import { Map } from 'immutable';

import { EditorBlock } from 'draft-js';

import {
  type DraftContentBlock,
  type TableEntityData,
  type DraftTextDirection,
} from '../models/types';

type Props = TableEntityData & {
  contentState: DraftContentBlock,
  block: DraftContentBlock,
  alignment: DraftTextDirection,
  blockProps: Object,
};

/**
 * Aled
 */
export const Table = (props: Props) => {
  const {
    block,
    contentState,
    blockProps: { editor },
  } = props;
  const prevBlock = contentState.getBlockBefore(block.getKey());
  // if this is not the first table block, then the table's DOM structure has been rendered and we target the <td> element in the applicable position
  if (prevBlock && prevBlock.getType() === 'table') {
    const position = block.getData().get('tablePosition');
    const target = editor && editor.editor.querySelector(`[data-position='${position}']`);
    if (target) {
      return createPortal(<EditorBlock {...props} />, target);
    }
    /**
     * If the target isn't in the DOM and this is the last cell in the table,
     * force the editor to render its internal DOM, otherwise the table contents may
     * not be visible in the editor until it receives focus.
     * Note restoreEditorDOM is a pre-defined function on the editor.
     * It also causes the editor to receive focus, so a fix to prevent unintented
     * focus is in the reset() function of index.js
     */
    const nextBlock = contentState.getBlockAfter(block.getKey());
    const nextBlockType = nextBlock && nextBlock.getType();
    if (editor && nextBlockType !== 'table') {
      editor.restoreEditorDOM();
    }
    return null;
  }
  // here we know we are rendering the first block of the table and will render the whole DOM structure of the table
  const data = block.getData();
  const tableKey = data.get('tableKey');
  const tableStyle = Map(data.get('tableStyle'))
    .mapKeys(k => camelCase(k))
    .toJS();
  const tableShape = data.get('tableShape');

  return (
    <table css={tableStyle}>
      <tbody>
        {tableShape.map((row, i: number) => (
          <tr
            key={i}
            css={
              data.get('rowStyle')[i] &&
              Map(data.get('rowStyle')[i])
                .mapKeys(k => camelCase(k))
                .toJS()
            }>
            {row.map((cell, j: number) => {
              const cellStyle = Map(cell.style)
                .mapKeys(k => camelCase(k))
                .toJS();
              if (cell.element === 'th') {
                return (
                  <th key={j} css={cellStyle} data-position={`${tableKey}-${i}-${j}`}>
                    {!!(i === 0 && j === 0) && <EditorBlock {...props} />}
                  </th>
                );
              }
              return (
                <td key={j} css={cellStyle} data-position={`${tableKey}-${i}-${j}`}>
                  {!!(i === 0 && j === 0) && <EditorBlock {...props} />}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
