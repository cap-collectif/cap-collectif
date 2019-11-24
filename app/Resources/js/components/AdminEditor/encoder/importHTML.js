// @flow
import { IFRAME, HR, IMAGE, LINK } from '../renderer/constants';
import { type DraftEntityMutability, type DraftEntityType } from '../models/types';
import { rgb2hex, getNodeAttributes } from './utils';

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
    const block = {};

    if (node.style.textAlign) {
      block.data = { alignment: node.style.textAlign };
    }
    // $FlowFixMe: style exists in parentNode
    else if (node.parentNode && node.parentNode.style.textAlign) {
      block.data = { alignment: node.parentNode.style.textAlign };
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
