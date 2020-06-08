// @flow
import * as React from 'react';
import {isPredefinedTraductionKey, translateContent} from "~/utils/ContentTranslator";

type Props = {
  value?: ?string | ?number,
  tagName?: string,
  className?: string,
};

export const WYSIWYGRender = (props: Props) => {
  const { value, tagName, className, ...rest } = props;

  // sorry for that: https://github.com/quilljs/quill/issues/1235
  if (!value || value === '<p><br /></p>') {
    return null;
  }

  // if the value is static, like deleted content, no need to wysiwig.
  // $FlowFixMe value may be a number.
  if (typeof(value) === 'string' && isPredefinedTraductionKey(value)) {
    // $FlowFixMe value may be a number.
    return <div className={`${className || ''} ql-editor`}>{translateContent(value)}</div>;
  }

  if (tagName) {
    const child = React.createElement(tagName, { dangerouslySetInnerHTML: { __html: value } });

    return <div className={`${className || ''} ql-editor`}>{child}</div>;
  }

  return (
    <div
      {...rest}
      className={`${className || ''} ql-editor`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default WYSIWYGRender;
