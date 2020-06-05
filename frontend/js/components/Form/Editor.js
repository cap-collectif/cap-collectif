// @flow
import React from 'react';
import Quill from 'quill';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import type { GlobalState } from '~/types';
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
  initialContent?: ?string,
  currentLanguage: string,
};

export class Editor extends React.Component<Props> {
  static defaultProps = {
    id: '',
    className: '',
    disabled: false,
  };

  editorRef: { current: null | HTMLDivElement };

  toolbarRef: { current: null | HTMLDivElement };

  quill: any;

  constructor(props: Props) {
    super(props);

    this.editorRef = React.createRef();
    this.toolbarRef = React.createRef();
  }

  componentDidMount() {
    const { disabled, onBlur, onChange, value, intl } = this.props;

    if (!disabled) {
      const size = Quill.import('formats/size');
      size.whitelist = ['small', 'normal', 'large'];

      Quill.register(size, true);
      const options = {
        modules: {
          toolbar: {
            container: this.toolbarRef.current,
          },
        },
        theme: 'snow',
        bounds: '#proposal_form_description',
      };
      this.quill = new Quill(this.editorRef.current, options);

      this.quill.getModule('toolbar').addHandler('image', () => {
        selectLocalImage(this.quill);
      });

      // See https://github.com/quilljs/quill/issues/2038 for accessibility
      this.quill.root.setAttribute('role', 'textbox');
      this.quill.root.setAttribute('aria-multiline', 'true');

      const linkTooltip = this.quill.theme.tooltip.root;

      if (linkTooltip) {
        linkTooltip.setAttribute('role', 'tooltip');
        linkTooltip.setAttribute('data-content', `${intl.formatMessage({ id: 'global.link' })} :`);
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
        this.quill.clipboard.dangerouslyPasteHTML(defaultValue);
      }

      this.quill.on('selection-change', range => {
        if (!range && onBlur) {
          onBlur();
        }
      });

      this.quill.on('text-change', () => {
        onChange(this.quill.root.innerHTML);
      });
    }
  }

  componentDidUpdate({ currentLanguage: prevDefaultLanguage, value: prevValue }: Props) {
    const {
      initialContent: newInitialContent,
      currentLanguage: newDefaultLanguage,
      value,
    } = this.props;

    if (prevDefaultLanguage !== newDefaultLanguage) {
      // On change does not trigger when we change the props value.
      // So we have to manually trigger this.
      this.quill.clipboard.dangerouslyPasteHTML(newInitialContent || '');
    }

    if (prevValue !== value && !value) {
      // Need this to reset value on reset with reduxForm
      this.quill.clipboard.dangerouslyPasteHTML(value);
    }

    return true;
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

const mapStateToProps = (state: GlobalState) => ({
  currentLanguage: state.language.currentLanguage,
});

export default connect(mapStateToProps)(injectIntl(Editor));
