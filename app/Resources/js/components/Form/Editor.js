// @flow
// Todo : ref Quill
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
import QuillToolbar from './QuillToolbar';
import Fetcher, { json } from '../../services/Fetcher';

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

  editorRef: { current: null | HTMLDivElement };

  toolbarRef: { current: null | HTMLDivElement };

  componentDidMount() {
    const { disabled, valueLink, onBlur, onChange, value, intl } = this.props;

    const options = {
      modules: {
        toolbar: {
          container: this.toolbarRef.current,
        },
      },
      theme: 'snow',
      bounds: '#proposal_form_description',
    };

    if (!disabled) {
      const quill = new Quill(this.editorRef.current, options);

      /**
       * Step3. insert image url to rich editor.
       */
      const insertToEditor = (url: string) => {
        // push image url to rich editor.
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
      };

      /**
       * Step2. save to server
       */
      const saveToServer = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        Fetcher.postFormData('/files', formData)
          .then(json)
          .then(res => {
            insertToEditor(res.url);
          });
      };

      /**
       * Step1. select local image
       */
      const selectLocalImage = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = () => {
          const file = input.files[0];

          // file type is only image.
          if (/^image\//.test(file.type)) {
            saveToServer(file);
          } else {
            console.warn('You could only upload images.');
          }
        };
      };

      // quill add image handler
      quill.getModule('toolbar').addHandler('image', () => {
        selectLocalImage();
      });

      const tooltip = quill.theme.tooltip.root;

      if (tooltip) {
        tooltip.setAttribute('data-content', `${intl.formatMessage({ id: 'editor.link' })} :`);
        const actionLink = tooltip.querySelector('.ql-action');
        const removeLink = tooltip.querySelector('.ql-remove');

        if (actionLink) {
          actionLink.setAttribute('data-content', intl.formatMessage({ id: 'action_edit' }));
          actionLink.setAttribute(
            'data-editing-content',
            intl.formatMessage({ id: 'global.save' }),
          );
        }

        if (removeLink) {
          removeLink.setAttribute('data-content', intl.formatMessage({ id: 'global.remove' }));
        }
      }

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
          console.log(quill.container.innerHTML);
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

export default injectIntl(Editor);
