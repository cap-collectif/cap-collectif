// @flow
// Todo : ref Quill
import React from 'react';
// import { injectIntl, type IntlShape } from 'react-intl';
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
      bounds: '#proposal_form_description'
    };

    if (!disabled) {
      const quill = new Quill(this.editorRef.current, options);

      const tooltip = quill.theme.tooltip.root;
      const preview = tooltip.getElementsByClassName('ql-preview')[0];
      const action = tooltip.getElementsByClassName('ql-action')[0];
      const remove = tooltip.getElementsByClassName('ql-remove')[0];

      preview.innerHTML = "previewwww";
      action.innerHTML = "actioon";
      remove.innerHTML = "remooove";

      // if (range === null || range.length === 0) {
      //   return;
      // }
      // let preview = quill.getText(range);
      // if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
      //   console.warn(preview)
      // }
      // const tooltip = quill.theme.tooltip;
      // tooltip.edit('link', 'https://');
      // console.log(quill);

      // console.warn(quill.getContents());

      // const imageHandler = () => {
      //   const range = quill.getSelection();
      //   const test = window.prompt('imaage');
      //   if (test) {
      //     quill.insertEmbed(range.index, 'image', test, Quill.sources.USER);
      //   }
      // };

      // const range = quill.getSelection();
      // const tooltip = quill.theme.tooltip;
      // console.log(tooltip.hasFocus());
      // tooltip.position(range);
      // tooltip.edit('link', 'https://');
      // console.log(tooltip);

      // const linkHandler = (val: boolean) => {
      //
      //   if(val) {
      //     const test = window.prompt('lieeen');
      //     if (test) {
      //       quill.format('link', test);
      //     }
      //   } else {
      //     quill.format('link', false);
      //   }
      // };

      // const toolbar = quill.getModule('toolbar');
      // toolbar.addHandler('link', linkHandler);
      // toolbar.addHandler('image', imageHandler);

      // quill.keyboard.addBinding({
      //   key: '9',
      //   shortKey: false,
      //   // handler: (range, context) => {
      //   //
      //   // }
      // });

      if (valueLink) {
        const defaultValue = valueLink.value;

        if (defaultValue) {
          quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }

        quill.on('text-change', () => {
          valueLink.requestChange(quill.container.innerHTML);
        });
      } else {
        const defaultValue = value;
        if (defaultValue) {
          quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }
        quill.on('selection-change', range => {
          if (!range) {
            onBlur(quill.container.innerHTML);
          }
        });
        quill.on('text-change', () => {
          onChange(quill.container.innerHTML);
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
