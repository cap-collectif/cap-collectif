// @flow
// Todo : ref Quill
import React from 'react';
import ReactDOM from 'react-dom';
import { injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
import QuillToolbar from './QuillToolbar';

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

class EditorOrigin extends React.Component<Props> {
  static defaultProps = {
    id: '',
    className: '',
    disabled: false,
  };

  constructor(props: Props) {
    super(props);

    // $FlowFixMe
    this.editorRef = React.createRef();
    // $FlowFixMe
    this.toolbarRef = React.createRef();
  }

  componentDidMount() {
    const { intl, disabled, onBlur, onChange, value, valueLink } = this.props;

    const options = {
      modules: {
        toolbar: {
          // $FlowFixMe
          container: ReactDOM.findDOMNode(this.toolbarRef.current),
        },
        // 'image-tooltip': {
        //   template: `
        //       <input class="input" type="textbox">
        //       <div class="preview">
        //         <span>${intl.formatMessage({ id: 'global.preview' })}</span>
        //       </div>
        //       <a href="javascript:;" class="cancel">
        //         ${intl.formatMessage({ id: 'global.cancel' })}</a>
        //       <a href="javascript:;" class="insert">
        //         ${intl.formatMessage({ id: 'global.insert' })}
        //       </a>`,
        // },
        // 'link-tooltip': {
        //   template: `
        //       <span class="title">
        //         ${intl.formatMessage({ id: 'editor.url' })}&nbsp;
        //       </span>
        //       <a href="#" class="url" target="_blank" href="about:blank"></a>
        //       <input class="input" type="text">
        //       <span>&nbsp;&#45;&nbsp;</span>
        //       <a href="javascript:;" class="change">
        //         ${intl.formatMessage({ id: 'global.change' })}
        //       </a>
        //       <a href="javascript:;" class="remove">
        //         ${intl.formatMessage({ id: 'global.remove' })}
        //       </a>
        //       <a href="javascript:;" class="done">
        //         ${intl.formatMessage({ id: 'global.done' })}
        //       </a>`,
        // },
      },
      theme: 'snow',
    };

    if (!disabled) {
      // $FlowFixMe
      const quill = new Quill(ReactDOM.findDOMNode(this.editorRef.current), options);
      // $FlowFixMe
      quill.getModule('keyboard').removeHotkeys(9);

      if (valueLink) {
        // eslint-disable-next-line no-console
        console.warn('This is deprecated please use redux-form instead of valueLink.');
        const defaultValue = valueLink.value;
        if (defaultValue) {
          // $FlowFixMe
          quill.setHTML(defaultValue);
        }
        // $FlowFixMe
        quill.on('text-change', () => {
          // $FlowFixMe
          valueLink.requestChange(quill.getHTML());
        });
      } else {
        const defaultValue = value;
        if (defaultValue) {
          // $FlowFixMe
          quill.setHTML(defaultValue);
        }
        // $FlowFixMe
        quill.on('selection-change', range => {
          if (!range) {
            // $FlowFixMe
            onBlur(quill.getHTML());
          }
        });
        // $FlowFixMe
        quill.on('text-change', () => {
          // $FlowFixMe
          onChange(quill.getHTML());
        });
      }
    }
  }

  // componentWillUnmount() {
  //   // $FlowFixMe
  //   if (quill) {
  //     // $FlowFixMe
  //     quill.destroy();
  //   }
  // }

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
        {/* $FlowFixMe */}
        <QuillToolbar ref={this.toolbarRef} />
        {/* $FlowFixMe */}
        <div ref={this.editorRef} style={{ position: 'static' }} />
      </div>
    );
  }
}

export default injectIntl(EditorOrigin);
