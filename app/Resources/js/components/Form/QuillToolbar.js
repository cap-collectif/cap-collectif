// @flow
import React from 'react';
import { type IntlShape, injectIntl } from 'react-intl';

type Props = {
  intl: IntlShape,
};

class QuillToolbar extends React.Component<Props> {
  render() {
    const { intl } = this.props;

    return (
      <React.Fragment>
        <span className="ql-formats">
          <select title={intl.formatMessage({ id: 'global.fontsize' })} className="ql-size">
            <option value="small">{intl.formatMessage({ id: 'editor.size.small' })}</option>
            <option selected>{intl.formatMessage({ id: 'editor.size.normal' })}</option>
            <option value="large">{intl.formatMessage({ id: 'editor.size.large' })}</option>
          </select>
        </span>
        <span className="ql-formats">
          <button title={intl.formatMessage({ id: 'global.bold' })} className="ql-bold" />
          <button title={intl.formatMessage({ id: 'global.italic' })} className="ql-italic" />
          <button title={intl.formatMessage({ id: 'global.underline' })} className="ql-underline" />
          <button title={intl.formatMessage({ id: 'global.strike' })} className="ql-strike" />
        </span>
        <span className="ql-formats">
          <button
            className="ql-list"
            value="ordered"
            title={intl.formatMessage({ id: 'editor.list' })}
          />
          <button
            className="ql-list"
            value="bullet"
            title={intl.formatMessage({ id: 'editor.bullet' })}
          />
          <button
            className="ql-indent"
            value="-1"
            // change title
            title={intl.formatMessage({ id: 'global.delete.indent' })}
          />
          <button
            className="ql-indent"
            value="+1"
            // change title
            title={intl.formatMessage({ id: 'global.indent' })}
          />
          <select title={intl.formatMessage({ id: 'editor.align.title' })} className="ql-align">
            <option label={intl.formatMessage({ id: 'editor.align.left' })} selected />
            <option value="center" label={intl.formatMessage({ id: 'editor.align.center' })} />
            <option value="right" label={intl.formatMessage({ id: 'editor.align.right' })} />
            <option value="justify" label={intl.formatMessage({ id: 'editor.align.justify' })} />
          </select>
        </span>
        <span className="ql-formats">
          <button title={intl.formatMessage({ id: 'editor.link' })} className="ql-link" />
          <button title={intl.formatMessage({ id: 'editor.image' })} className="ql-image" />
        </span>
      </React.Fragment>
    );
  }
}

export default injectIntl(QuillToolbar);
