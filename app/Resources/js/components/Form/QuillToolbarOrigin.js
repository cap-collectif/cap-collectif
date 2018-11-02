// @flow
import React from 'react';
import { type IntlShape, FormattedMessage, injectIntl } from 'react-intl';

type Props = {
  intl: IntlShape,
};

class QuillToolbar extends React.Component<Props> {
  render() {
    const { intl } = this.props;

    return (
      <div>
        <span className="ql-formats">
          <select title="Size" className="ql-size">
            <option value="10px">{intl.formatMessage({ id: 'editor.size.small' })}</option>
            <option value="13px" selected>
              {intl.formatMessage({ id: 'editor.size.normal' })}
            </option>
            <option value="18px">{intl.formatMessage({ id: 'editor.size.large' })}</option>
          </select>
        </span>
        <span className="ql-formats">
          <span className="ql-format-button ql-bold" />
          <span className="ql-format-separator" />
          <span className="ql-format-button ql-italic" />
          <span className="ql-format-separator" />
          <span className="ql-format-button ql-underline" />
        </span>
        <span className="ql-formats">
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
          <select title={intl.formatMessage({ id: 'editor.align.title' })} className="ql-align">
            <option value="left" label={intl.formatMessage({ id: 'editor.align.left' })} selected />
            <option value="center" label={intl.formatMessage({ id: 'editor.align.center' })} />
            <option value="right" label={intl.formatMessage({ id: 'editor.align.right' })} />
            <option value="justify" label={intl.formatMessage({ id: 'editor.align.justify' })} />
          </select>
        </span>
        <span className="ql-formats">
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
  }
}

export default injectIntl(QuillToolbar);
