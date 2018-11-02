// @flow
// Todo : ref Quill
import React from 'react';
// import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
import QuillToolbar from './QuillToolbar';

type Props = {
  // intl: IntlShape,
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
    const { className, disabled, id } = this.props;
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
          {/* $FlowFixMe */}
          <QuillToolbar />
        </div>
        <div ref={this.editorRef} />
      </div>
    );
  }
}

export default Editor;
