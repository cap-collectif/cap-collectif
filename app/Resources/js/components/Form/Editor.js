// @flow
// Todo : ref Quill
import React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
// import QuillToolbar from './QuillToolbar';

type Props = {
  intl: IntlShape,
  valueLink?: Object,
  value?: any,
  onChange: Function,
  onBlur: Function,
  id?: string,
  className: string,
  disabled?: boolean,
};

class Editor extends React.Component<Props> {
  static defaultProps = {
    id: '',
    className: '',
    disabled: false,
  };

  constructor(props: Props) {
    super(props);

    this.editorRef = React.createRef();
    this.toolbarRef = React.createRef();
  }

  // $FlowFixMe
  editorRef: { current: null | React.ElementRef<'div'> };

  // $FlowFixMe
  toolbarRef: { current: null | React.ElementRef<'div'> };

  componentDidMount() {
    const { disabled, valueLink, onBlur, onChange, value } = this.props;

    const options = {
      modules: {
        toolbar: {
          container: this.toolbarRef.current,
        },
      },
      theme: 'snow',
    };

    if (!disabled) {
      const quill = new Quill(this.editorRef.current, options);
      quill.keyboard.addBinding({
        key: '9',
        shortKey: false,
        // handler: (range, context) => {
        //
        // }
      });

      if (valueLink) {
        const defaultValue = valueLink.value;

        if (defaultValue) {
          quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }

        quill.on('text-change', () => {
          valueLink.requestChange(quill.getContents());
        });
      } else {
        const defaultValue = value;
        if (defaultValue) {
          quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }
        quill.on('selection-change', range => {
          if (!range) {
            onBlur(quill.getContents());
          }
        });
        quill.on('text-change', () => {
          onChange(quill.getContents());
        });
      }
    }
  }

  render() {
    const { className, disabled, id, intl } = this.props;
    const classes = {
      editor: !disabled,
      'form-control': disabled,
      [className]: true,
    };
    if (disabled) {
      return <textarea id={id} className={classNames(classes)} disabled />;
    }
    return (
      <div id={id} className={classNames(classes)}>
        <div ref={this.toolbarRef}>
          <span className="ql-formats">
            <select title="Size" className="ql-size">
              <option value="small">{intl.formatMessage({ id: 'editor.size.small' })}</option>
              <option selected>{intl.formatMessage({ id: 'editor.size.normal' })}</option>
              <option value="large">{intl.formatMessage({ id: 'editor.size.large' })}</option>
            </select>
          </span>
          <span className="ql-formats">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-strike" />
          </span>
          <span className="ql-formats">
            <button
              className="ql-list"
              value="ordered"
              title={<FormattedMessage id="editor.list" />}
            />
            <button
              className="ql-list"
              value="bullet"
              title={<FormattedMessage id="editor.bullet" />}
            />
            <button
              className="ql-indent"
              value="-1"
              title={<FormattedMessage id="editor.bullet" />}
            />
            <button
              className="ql-indent"
              value="+1"
              title={<FormattedMessage id="editor.bullet" />}
            />
            <select title={intl.formatMessage({ id: 'editor.align.title' })} className="ql-align">
              <option label={intl.formatMessage({ id: 'editor.align.left' })} selected />
              <option value="center" label={intl.formatMessage({ id: 'editor.align.center' })} />
              <option value="right" label={intl.formatMessage({ id: 'editor.align.right' })} />
              <option value="justify" label={intl.formatMessage({ id: 'editor.align.justify' })} />
            </select>
          </span>
          <span className="ql-formats">
            <button title={<FormattedMessage id="editor.link" />} className="ql-link" />
            <button title={<FormattedMessage id="editor.image" />} className="ql-image" />
          </span>
        </div>
        <div ref={this.editorRef} />
      </div>
    );
  }
}

export default injectIntl(Editor);
