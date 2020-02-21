// @flow
import { genKey } from 'draft-js';
import { isEmpty } from 'lodash';
import { IFRAME, HR, IMAGE, LINK } from '../renderer/constants';
import { type DraftEntityMutability, type DraftEntityType } from '../models/types';
import { rgb2hex, getNodeAttributes } from './utils';

let tableKey;

// helper function converts style attribute string into key-value pairs
function convertStyleStringToObject(style = '', data = {}) {
  if (!style) {
    return null;
  }
  return style
    .split(';')
    .filter(s => s.includes(':'))
    .map(s => s.split(':'))
    .reduce((map, s) => {
      const key = s.shift().trim();
      const val = s.join(':').trim();
      map[key] = val;
      return map;
    }, data);
}

export default {
  // See: https://github.com/HubSpot/draft-convert/blob/3205227ff8753df59885430c097f21adba8c42df/src/convertFromHTML.js#L198
  htmlToStyle: (nodeName: string, node: HTMLElement, currentStyle: Object) => {
    currentStyle = currentStyle
      .withMutations(style => {
        if (node.style.backgroundColor) {
          style.add(`bg-${rgb2hex(node.style.backgroundColor)}`);
        }

        if (node.style.color) {
          style.add(`color-${rgb2hex(node.style.color)}`);
        }
      })
      .toOrderedSet();

    return currentStyle;
  },
  htmlToEntity: (
    nodeName: string,
    node: HTMLElement,
    createEntity: (DraftEntityType, DraftEntityMutability, ?Object) => void,
  ) => {
    const attributes = getNodeAttributes(node);
    // We don't want to pass style because it's the purpose of htmlToStyle
    delete attributes.style;

    switch (nodeName) {
      case 'a':
        return createEntity(LINK, 'MUTABLE', {
          // $FlowFixMe: node can be an HTMLLinkElement with href
          href: node.href,
          // $FlowFixMe: node can be an HTMLLinkElement with target
          targetBlank: attributes.target === '_blank',
        });
      case 'img': {
        if (node.style) {
          attributes.border = parseInt(node.style.borderWidth.replace('px', ''), 10) || undefined;
          attributes.marginX = parseInt(node.style.marginLeft.replace('px', ''), 10) || undefined;
          attributes.marginY = parseInt(node.style.marginTop.replace('px', ''), 10) || undefined;
          attributes.float = node.style.float || undefined;
        }

        return createEntity(IMAGE, 'IMMUTABLE', attributes);
      }
      case 'iframe': {
        if (node.style) {
          attributes.marginX = parseInt(node.style.marginLeft.replace('px', ''), 10) || undefined;
          attributes.marginY = parseInt(node.style.marginTop.replace('px', ''), 10) || undefined;
        }

        return createEntity(IFRAME, 'IMMUTABLE', attributes);
      }
      case 'hr':
        return createEntity(HR, 'IMMUTABLE');
      default:
        return null;
    }
  },
  htmlToBlock: (nodeName: string, node: HTMLElement) => {
    const block = ({}: Object);

    if (node.style.textAlign) {
      block.data = { alignment: node.style.textAlign };
    }
    // $FlowFixMe: style exists in parentNode
    else if (node.parentNode && node.parentNode.style.textAlign) {
      block.data = { alignment: node.parentNode.style.textAlign };
      // $FlowFixMe: style exists in parentNode
    } else if (node.parentNode && node.parentNode.style.float) {
      block.data = { alignment: node.parentNode.style.float };
    }
    if (['TD', 'TH'].includes(node.tagName)) {
      // empty nodes get ignored and can break a table, replace unrendered characters
      if (isEmpty(node.textContent.replace(/\n|\s/g, ''))) {
        node.innerHTML = node.innerHTML.replace(/\n|<br>|<br\/>/g, '<br>').replace(/\s/g, '&nbsp;');
      }
      /**
       * To preserve tables when converting html into Draft block types, we store the full
       * table specifications with the first "cell", and save the table position for the others
       */
      const tableEl = node.closest('table');
      const prevCell = node.previousElementSibling;
      const row = node.parentNode;
      // $FlowFixMe need yet to type node
      const prevRow = row && row.previousElementSibling;
      // Check if this is not the first cell in the table, if it's not then we traverse the table
      // structure just far enough to get the cell's position and store it in the data used to create
      // the corresponding Draft block
      if (prevCell || prevRow) {
        let found = false;
        for (
          let i = 0,
            rows = (tableEl && tableEl.querySelectorAll('tr')) || [],
            rowCount = rows?.length || 0;
          i < rowCount;
          i++
        ) {
          for (let j = 0, cells = rows[i].children, colCount = cells.length; j < colCount; j++) {
            if (cells[j] === node) {
              block.data.tableKey = tableKey;
              block.data.tablePosition = `${tableKey}-${i}-${j}`;
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
        return { type: 'table', data: block.data };
      }
      // Only the first cell in the table will go through the processing below, so the Draft block
      // created for it will have all the necessary data to render the empty table structure into
      // which we render the rest of the table blocks.
      const tableShape = [];
      tableKey = genKey();
      block.data.tableKey = tableKey;
      block.data.tablePosition = `${tableKey}-0-0`;
      if (!tableEl) return;
      block.data.tableStyle = convertStyleStringToObject(tableEl.getAttribute('style')) || {
        'border-collapse': 'collapse',
        margin: '15px 0',
        width: '100%',
      };
      for (
        let i = 0, rows = tableEl.querySelectorAll('tr'), rowCount = rows.length;
        i < rowCount;
        i++
      ) {
        tableShape.push([]);
        const defaultStyle = {};
        if (i === 0) {
          if (node.tagName === 'TH') {
            defaultStyle['background-color'] = 'rgba(240, 240, 240, 0.8)';
          }
          block.data.rowStyle = [
            convertStyleStringToObject(rows[i].getAttribute('style')) || defaultStyle,
          ];
        } else {
          block.data.rowStyle.push(
            convertStyleStringToObject(rows[i].getAttribute('style')) || defaultStyle,
          );
        }
        for (let j = 0, cells = rows[i].children, colCount = cells.length; j < colCount; j++) {
          // eslint-disable-next-line no-shadow
          const defaultStyle: Object = {
            border: '1px solid rgba(0, 0, 0, 0.2)',
            padding: '6px',
            'text-align': 'center',
          };
          if (cells[j].tagName === 'TH') {
            defaultStyle['font-weight'] = 'bold';
          }
          const cellStyle =
            convertStyleStringToObject(cells[j].getAttribute('style')) || defaultStyle;
          tableShape[i][j] = {
            node: cells[j].tagName === 'TD' ? 'td' : 'th',
            style: cellStyle,
          };
        }
      }
      block.data.tableShape = tableShape;
      return { type: 'table', data: block.data };
    }

    switch (nodeName) {
      case 'img':
      case 'iframe':
        return { type: 'atomic', ...block };
      case 'hr':
        return { type: 'atomic' };
      default:
        return block;
    }
  },
};
