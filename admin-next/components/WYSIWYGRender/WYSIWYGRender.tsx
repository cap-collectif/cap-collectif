import * as React from 'react';
import truncateHtml from 'html-truncate';
import { isPredefinedTraductionKey, translateContent } from '@utils/contentTranslator';

type Props = {
    truncate?: number,
    value?: string,
    tagName?: string,
    className?: string,
    raw?: boolean,
};

export const WYSIWYGRender = (props: Props) => {
    const { value, tagName, className, truncate, raw, ...rest } = props;

    // sorry for that: https://github.com/quilljs/quill/issues/1235
    if (!value || value === '<p><br /></p>') {
        return null;
    }

    // if the value is static, like deleted content, no need to wysiwig.
    if (typeof value === 'string' && isPredefinedTraductionKey(value)) {
        return (
            <div className={`${className || ''} ql-editor wysiwyg-render`}>{translateContent(value)}</div>
        );
    }

    let truncatedValue = value;

    if (truncate) {
        truncatedValue = truncateHtml(truncatedValue, truncate);
    }

    if (tagName) {
        const child = React.createElement(tagName, {
            dangerouslySetInnerHTML: { __html: truncatedValue },
        });

        return raw ? (
            child
        ) : (
            <div className={`${className || ''} ql-editor wysiwyg-render`}>{child}</div>
        );
    }

    return (
        <div
            {...rest}
            className={`${className || ''} ql-editor wysiwyg-render`}
            dangerouslySetInnerHTML={{ __html: truncatedValue }}
        />
    );
};

export default WYSIWYGRender;
