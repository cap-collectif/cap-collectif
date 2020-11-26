// @flow
import * as React from 'react';

function hasProps(jsx: React.Node) {
  return Object.prototype.hasOwnProperty.call(jsx, 'props');
}

function jsxInnerText(jsx: React.Node): string {
  if (jsx === null || typeof jsx === 'boolean' || typeof jsx === 'undefined') {
    return '';
  }

  if (typeof jsx === 'number') {
    return jsx.toString();
  }

  if (typeof jsx === 'string') {
    return jsx;
  }

  if (Array.isArray(jsx)) {
    return jsx.reduce<string>((acc, node) => acc + jsxInnerText(node), '');
  }

  if (hasProps(jsx) && Object.prototype.hasOwnProperty.call((jsx: any).props, 'children')) {
    return jsxInnerText((jsx: any).props.children);
  }

  return '';
}

export default jsxInnerText;
