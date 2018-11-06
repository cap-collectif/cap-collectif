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
          <select aria-label={intl.formatMessage({ id: 'global.fontsize' })} className="ql-size">
            <option value="small">{intl.formatMessage({ id: 'editor.size.small' })}</option>
            <option value="normal" selected>
              {intl.formatMessage({ id: 'editor.size.normal' })}
            </option>
            <option value="large">{intl.formatMessage({ id: 'editor.size.large' })}</option>
          </select>
        </span>
        <span className="ql-formats">
          <button aria-label={intl.formatMessage({ id: 'global.bold' })} className="ql-bold" />
          <button aria-label={intl.formatMessage({ id: 'global.italic' })} className="ql-italic" />
          <button
            aria-label={intl.formatMessage({ id: 'global.underline' })}
            className="ql-underline"
          />
          <button aria-label={intl.formatMessage({ id: 'global.strike' })} className="ql-strike" />
        </span>
        <span className="ql-formats">
          <button
            className="ql-list"
            value="ordered"
            aria-label={intl.formatMessage({ id: 'editor.list' })}
          />
          <button
            className="ql-list"
            value="bullet"
            aria-label={intl.formatMessage({ id: 'editor.bullet' })}
          />
          <button
            className="ql-indent"
            value="-1"
            aria-label={intl.formatMessage({ id: 'global.delete.indent' })}
          />
          <button
            className="ql-indent"
            value="+1"
            aria-label={intl.formatMessage({ id: 'global.indent' })}
          />
          <select
            aria-label={intl.formatMessage({ id: 'editor.align.title' })}
            className="ql-align">
            <option aria-label={intl.formatMessage({ id: 'editor.align.left' })} selected />
            <option value="center" aria-label={intl.formatMessage({ id: 'editor.align.center' })} />
            <option value="right" aria-label={intl.formatMessage({ id: 'editor.align.right' })} />
            <option
              value="justify"
              aria-label={intl.formatMessage({ id: 'editor.align.justify' })}
            />
          </select>
        </span>
        <span className="ql-formats">
          <button aria-label={intl.formatMessage({ id: 'editor.link' })} className="ql-link" />
          <button aria-label={intl.formatMessage({ id: 'editor.image' })} className="ql-image" />
        </span>
      </React.Fragment>
    );
  }
}

export default injectIntl(QuillToolbar);
