// @flow
import React, { useState, useEffect, type Node } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

type Props = {
  intl: IntlShape,
  contentState: Object,
  entityKey: string,
  children: Node,
};

/**
 * Custom component to render Link entity
 */
function Link({ intl, contentState, entityKey, children }: Props) {
  const { url } = contentState.getEntity(entityKey).getData();
  const [open, setOpen] = useState(false);
  const [urlValue, setUrlValue] = useState(url);

  useEffect(() => {
    if (open) {
      const urlPrompt = window.prompt(intl.formatMessage({ id: 'editor.link.url' }), urlValue); // eslint-disable-line no-alert

      if (urlPrompt) {
        setUrlValue(urlPrompt);
      }

      setOpen(false);
    }
  }, [open, setUrlValue, setOpen, urlValue, intl]);

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

export default injectIntl(Link);
