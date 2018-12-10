// @flow
import * as React from 'react';

type Props = {
  value?: ?string,
  tagName?: string,
  className?: string,
};

export const WYSIWYGRender = (props: Props) => {
  const { value, tagName, className } = props;

  if (!value) {
    return null;
  }

  if (tagName) {
    const child = React.createElement(tagName, { dangerouslySetInnerHTML: { __html: value } });

    return <div className={`${className || ''} ql-editor`}>{child}</div>;
  }

  return (
    <div className={`${className || ''} ql-editor`} dangerouslySetInnerHTML={{ __html: value }} />
  );
};

export default WYSIWYGRender;
