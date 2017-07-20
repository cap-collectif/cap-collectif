import React from 'react';
import { FormattedMessage } from 'react-intl';

const QuillToolbar = React.createClass({
  render() {
    return (
      <div style={{ borderBottom: '1px solid #ddd', padding: '5px 12px' }}>
        <span className="ql-format-group">
          <select title="Size" className="ql-size">
            <option value="10px">
              {<FormattedMessage id="editor.size.small" />}
            </option>
            <option value="13px" selected>
              {<FormattedMessage id="editor.size.normal" />}
            </option>
            <option value="18px">
              {<FormattedMessage id="editor.size.large" />}
            </option>
          </select>
        </span>
        <span className="ql-format-group">
          <span className="ql-format-button ql-bold" />
          <span className="ql-format-separator" />
          <span className="ql-format-button ql-italic" />
          <span className="ql-format-separator" />
          <span className="ql-format-button ql-underline" />
        </span>
        <span className="ql-format-group">
          <span
            title={<FormattedMessage id="editor.list" />}
            className="ql-format-button ql-list"
          />
          <span className="ql-format-separator" />
          <span
            title={<FormattedMessage id="editor.bullet" />}
            className="ql-format-button ql-bullet"
          />
          <span className="ql-format-separator" />
          <select
            title={<FormattedMessage id="editor.align.title" />}
            className="ql-align">
            <option
              value="left"
              label={<FormattedMessage id="editor.align.left" />}
              selected
            />
            <option
              value="center"
              label={<FormattedMessage id="editor.align.center" />}
            />
            <option
              value="right"
              label={<FormattedMessage id="editor.align.right" />}
            />
            <option
              value="justify"
              label={<FormattedMessage id="editor.align.justify" />}
            />
          </select>
        </span>
        <span className="ql-format-group">
          <span
            title={<FormattedMessage id="editor.link" />}
            className="ql-format-button ql-link"
          />
          <span className="ql-format-separator" />
          <span
            title={<FormattedMessage id="editor.image" />}
            className="ql-format-button ql-image"
          />
        </span>
      </div>
    );
  },
});

export default QuillToolbar;
