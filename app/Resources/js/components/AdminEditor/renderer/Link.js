// @flow
import React, { useState, useEffect, type Node } from 'react';

type Props = {
  contentState: Object,
  entityKey: string,
  children: Node,
};

/**
 * Custom component to render Link entity
 */
function Link({ contentState, entityKey, children }: Props) {
  const { url } = contentState.getEntity(entityKey).getData();
  const [open, setOpen] = useState(false);
  const [urlValue, setUrlValue] = useState(url);

  useEffect(() => {
    if (open) {
      const urlPrompt = window.prompt('URL du lien', urlValue); // eslint-disable-line no-alert

      if (urlPrompt) {
        setUrlValue(urlPrompt);
      }

      setOpen(false);
    }
  }, [open, setUrlValue, setOpen, urlValue]);

  return (
    <a
      className="link"
      href={urlValue}
      // rel="noopener noreferrer"
      // target="_blank"
      aria-label={urlValue}
      onDoubleClick={() => setOpen(true)}>
      {children}
    </a>
  );
}

export default Link;
