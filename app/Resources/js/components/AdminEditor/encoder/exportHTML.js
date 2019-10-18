// @flow

export default (editorState: Object) => ({
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
    atomic: (block: Object) => {
      const entityKey = block.getEntityAt(0);
      const entity = editorState.getCurrentContent().getEntity(entityKey);
      const entityType = entity.getType();
      const entityData = entity.getData();

      // NOTE: entityType IMAGE is support by default by draft-js-export-html
      switch (entityType) {
        case 'IFRAME': {
          const blockAlign = block.getData().get('alignment');
          const style = blockAlign ? `style="text-align: ${blockAlign}"` : '';
          return `<div ${style}><iframe src="${entityData.src}" width="${entityData.width}" height="${entityData.height}" title="${entityData.title}" ${entityData.description} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        }
        case 'HR':
          return '<hr />';
        default:
          return null;
      }
    },
  },
  blockStyleFn: (block: Object) => {
    if (block.getData().get('alignment')) {
      return {
        style: {
          textAlign: block.getData().get('alignment'),
        },
      };
    }
  },
});
