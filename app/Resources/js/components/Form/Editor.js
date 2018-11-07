// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
import QuillToolbar from './QuillToolbar';
import { selectLocalImage } from './EditorImageUpload';

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

      const size = Quill.import('formats/size');
      size.whitelist = ['small', 'normal', 'large'];
      Quill.register(size, true);

      quill.getModule('toolbar').addHandler('image', () => {
        selectLocalImage(quill);
      });

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
          removeLink.setAttribute('data-content', intl.formatMessage({ id: 'global.remove' }));
        }

        if (input) {
          input.setAttribute('aria-label', intl.formatMessage({ id: 'editor.add.link' }));
        }
      }

      const quillValue = () => `<div class="ql-editor">${quill.root.innerHTML}</div>`;

      if (valueLink) {
        const defaultValue = valueLink.value;

        if (defaultValue) {
          quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }

        quill.on('text-change', () => {
          valueLink.requestChange(quillValue());
        });
      } else {
        const defaultValue = value;
        if (defaultValue) {
          quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }
        quill.on('selection-change', range => {
          if (!range) {
            onBlur(quillValue());
          }
        });
        quill.on('text-change', () => {
          onChange(quillValue());
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
