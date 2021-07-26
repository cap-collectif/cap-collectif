// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import type { GlobalState } from '~/types';
import QuillToolbar from './QuillToolbar';
import { selectLocalImage } from './EditorImageUpload';
import Text from '~ui/Primitives/Text';

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
  withCharacterCounter?: boolean,
  maxLength?: string,
};

type State = {|
  valueWithoutHtml: ?string,
|};

export const Container: StyledComponent<{ hasCounter: boolean }, {}, HTMLDivElement> = styled.div`
  ${props =>
    props.hasCounter &&
    `
    .editor .ql-container .ql-editor {
      padding-top: 20px;
      padding-bottom: 20px;
    }
  `}

  .character-counter {
    position: absolute;
    bottom: 5px;
    right: 20px;
  }
`;

export class Editor extends React.Component<Props, State> {
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
    this.state = {
      valueWithoutHtml: null,
    };
  }

  componentDidMount() {
    if (typeof document === 'undefined') {
      return;
    }
    // eslint-disable-next-line
    const Quill = require('quill');

    const { onBlur, onChange, value, intl, disabled, maxLength } = this.props;

    const size = Quill.import('formats/size');
    size.whitelist = ['small', 'normal', 'large'];

    Quill.register(size, true);
    const options = {
      modules: {
        keyboard: {
          bindings: {
            tab: false,
          },
        },
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
        actionLink.setAttribute('data-editing-content', intl.formatMessage({ id: 'global.save' }));
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
      this.setState({ valueWithoutHtml: this.quill.root.innerText });
    }

    this.quill.on('selection-change', range => {
      if (!range && onBlur) {
        onBlur();
      }
    });

    this.quill.on('text-change', () => {
      const valueWithoutHtml = this.quill.root.textContent;
      const valueLength = this.quill.getLength() - 1;

      if (valueLength > parseInt(maxLength, 10)) {
        return this.quill.deleteText(parseInt(maxLength, 10), valueLength);
      }

      onChange(this.quill.root.innerHTML);
      this.setState({ valueWithoutHtml });
    });

    this.quill.enable(!disabled);
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
    const { className, id, withCharacterCounter, maxLength } = this.props;
    const { valueWithoutHtml } = this.state;

    const classes = {
      editor: true,
      'form-control': false,
      [className]: true,
    };

    return (
      <Container
        id={id}
        className={classNames(classes)}
        hasCounter={withCharacterCounter}
        aria-labelledby={id ? `label-${id}` : ''}>
        <div ref={this.toolbarRef}>
          <QuillToolbar onFocus={() => this.quill.focus()} />
        </div>
        <div ref={this.editorRef} />
        {withCharacterCounter && maxLength && (
          <Text className="character-counter" color="gray.500" fontSize={1}>
            {`${valueWithoutHtml?.length || 0}/${parseInt(maxLength, 10)}`}
          </Text>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  currentLanguage: state.language.currentLanguage,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(Editor));
