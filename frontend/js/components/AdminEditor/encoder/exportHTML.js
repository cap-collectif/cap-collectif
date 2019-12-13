// @flow
import { IFRAME, IMAGE, HR, LINK } from '../renderer/constants';
import type { DraftEditorState, DraftContentBlock, DraftEntity } from '../models/types';

export default (currentContent: DraftEditorState) => ({
  inlineStyleFn: (styles: Object) => {
    const colorKey = 'color-';
    const bgColorKey = 'bg-';
    const color = styles.filter((value: Object) => value.startsWith(colorKey)).first();
    const bgColor = styles.filter((value: Object) => value.startsWith(bgColorKey)).first();

    let style = {};

    if (color) {
      style = {
        style: {
          color: color.replace(colorKey, ''),
        },
      };
    }

    if (bgColor) {
      style = {
        style: {
          ...style.style,
          backgroundColor: bgColor.replace(bgColorKey, ''),
        },
      };
    }

    return Object.keys(style).length > 0 ? style : null;
  },
  blockRenderers: {
    unstyled: (block: DraftContentBlock) => {
      if (block.getText() === '') {
        return '<p>\n</p>';
      }
    },
    atomic: (block: DraftContentBlock) => {
      const entityKey = block.getEntityAt(0);
      const entity = currentContent.getEntity(entityKey);
      const entityType = entity.getType();
      const entityData = entity.getData();

      // NOTE: entityType IMAGE is support by default by draft-js-export-html
      switch (entityType) {
        case IFRAME: {
          const blockAlign = block.getData().get('alignment');
          const style = blockAlign ? `style="text-align: ${blockAlign}"` : '';
          const iframeStyle = `${
            entityData.marginX
              ? `margin-left: ${entityData.marginX}px; margin-right: ${entityData.marginX}px;`
              : ''
          } ${
            entityData.marginY
              ? `margin-top: ${entityData.marginY}px; margin-bottom: ${entityData.marginY}px;`
              : ''
          }`;
          const attributes = `${entityData.title ? `title="${entityData.title}"` : ''} ${
            entityData.width ? `width="${entityData.width}"` : ''
          } ${entityData.height ? `height="${entityData.height}"` : ''}`;
          return `<figure ${style.trim()}><iframe src="${
            entityData.src
          }" ${attributes} style="${iframeStyle.trim()}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>`;
        }
        case IMAGE: {
          const blockAlign = block.getData().get('alignment');
          const style = `${blockAlign ? `text-align: ${blockAlign};` : ''}`;
          const imgStyle = `max-width: 100%; ${
            entityData.border ? `border-width: ${entityData.border}px; border-style: solid;` : ''
          } ${
            entityData.marginX
              ? `margin-left: ${entityData.marginX}px; margin-right: ${entityData.marginX}px;`
              : ''
          } ${
            entityData.marginY
              ? `margin-top: ${entityData.marginY}px; margin-bottom: ${entityData.marginY}px;`
              : ''
          }`;
          const attributes = `${entityData.width ? `width="${entityData.width}"` : ''} ${
            entityData.height ? `height="${entityData.height}"` : ''
          }`;
          return `<figure style="${style.trim()}"><img src="${entityData.src}" alt="${
            entityData.alt
          }" ${attributes} style="${imgStyle.trim()}" /></figure>`;
        }
        case HR:
          return '<hr />';
        default:
          return null;
      }
    },
  },
  blockStyleFn: (block: DraftContentBlock) => {
    if (block.getData().get('alignment')) {
      return {
        style: {
          textAlign: block.getData().get('alignment'),
        },
      };
    }
  },
  entityStyleFn: (entity: DraftEntity) => {
    const entityType = entity.get('type');
    if (entityType === LINK) {
      const { href, targetBlank } = entity.getData();
      return {
        element: 'a',
        attributes: {
          href,
          target: targetBlank ? '_blank' : undefined,
          rel: targetBlank ? 'noopener noreferrer' : undefined,
        },
      };
    }
  },
});
