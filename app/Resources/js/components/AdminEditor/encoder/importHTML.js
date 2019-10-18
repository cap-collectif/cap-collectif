// @flow
import { type DraftEntityMutability, type DraftEntityType } from '../models/types';

export default {
  // See: https://github.com/HubSpot/draft-convert/blob/3205227ff8753df59885430c097f21adba8c42df/src/convertFromHTML.js#L198
  htmlToStyle: (nodeName: string, node: HTMLElement, currentStyle: Object) => {
    currentStyle = currentStyle
      .withMutations(style => {
        if (node.style.backgroundColor) {
          style.add(`bg-${node.style.backgroundColor}`);
        }

        if (node.style.color) {
          style.add(`color-${node.style.color}`);
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
    const attributes = {};

    // Store all attributes of the node
    if (node.attributes) {
      // node.attributes is a NamedNodeMap non-iterable with map()
      // see: https://developer.mozilla.org/fr/docs/Web/API/NamedNodeMap
      for (let i = 0, len = node.attributes.length; i < len; i++) {
        attributes[node.attributes[i].name] = node.attributes[i].value;
      }

      // We don't want to pass style because it's the purpose of htmlToStyle
      delete attributes.style;
    }

    switch (nodeName) {
      case 'a':
        // $FlowFixMe node can be an HTMLLinkElement with href
        return createEntity('LINK', 'MUTABLE', { url: node.href });
      case 'img':
        return createEntity('IMAGE', 'IMMUTABLE', attributes);
      case 'iframe':
        return createEntity('IFRAME', 'IMMUTABLE', attributes);
      case 'hr':
        return createEntity('HR', 'IMMUTABLE');
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
