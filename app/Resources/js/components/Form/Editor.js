// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
import QuillToolbar from './QuillToolbar';
import { selectLocalImage } from './EditorImageUpload';

type Props = {
  intl: IntlShape,
  value?: any,
  onChange: Function,
  onBlur: Function,
  id?: string,
  className: string,
  disabled?: boolean,
};

export class Editor extends React.Component<Props> {
  static defaultProps = {
    id: '',
    className: '',
    disabled: false,
  };

  editorRef: { current: null | HTMLDivElement };

  toolbarRef: { current: null | HTMLDivElement };

  constructor(props: Props) {
    super(props);

    this.editorRef = React.createRef();
    this.toolbarRef = React.createRef();
  }

  componentDidMount() {
    const { disabled, onBlur, onChange, value, intl } = this.props;

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

      const size = Quill.import('formats/size');
      size.whitelist = ['small', 'normal', 'large'];
      Quill.register(size, true);

      quill.getModule('toolbar').addHandler('image', () => {
        selectLocalImage(quill);
      });

      // See https://github.com/quilljs/quill/issues/2038 for accessibility
      quill.root.setAttribute('role', 'textbox');
      quill.root.setAttribute('aria-multiline', 'true');

      const linkTooltip = quill.theme.tooltip.root;

      if (linkTooltip) {
        linkTooltip.setAttribute('role', 'tooltip');
        linkTooltip.setAttribute('data-content', `${intl.formatMessage({ id: 'editor.link' })} :`);
        const actionLink = linkTooltip.querySelector('.ql-action');
        const removeLink = linkTooltip.querySelector('.ql-remove');
        const input = linkTooltip.querySelector('input');

        if (actionLink) {
          actionLink.setAttribute('data-content', intl.formatMessage({ id: 'action_edit' }));
          actionLink.setAttribute(
            'data-editing-content',
            intl.formatMessage({ id: 'global.save' }),
          );
        }

        if (removeLink) {
          removeLink.setAttribute('data-content', intl.formatMessage({ id: 'global.delete' }));
        }

        if (input) {
          input.setAttribute('aria-label', intl.formatMessage({ id: 'editor.add.link' }));
        }
      }

      const defaultValue = value;
      if (defaultValue) {
        quill.clipboard.dangerouslyPasteHTML(defaultValue);
      }
      quill.on('selection-change', range => {
        if (!range) {
          onBlur(quill.root.innerHTML);
        }
      });
      quill.on('text-change', () => {
        onChange(quill.root.innerHTML);
      });
    }
  }

  render() {
    const { className, disabled, id, value } = this.props;

    const classes = {
      editor: !disabled,
      'form-control': disabled,
      [className]: true,
    };
    if (disabled) {
      return (
        <div
          contentEditable={false}
          id={id}
          className={classNames(classes)}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }
    return (
      <div id={id} className={classNames(classes)}>
        <div ref={this.toolbarRef}>
          <QuillToolbar />
        </div>
        <div ref={this.editorRef} />
      </div>
    );
  }
}

export default injectIntl(Editor);
