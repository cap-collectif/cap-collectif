import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import Quill from 'quill';
import QuillToolbar from './QuillToolbar';

const Editor = React.createClass({
  propTypes: {
    valueLink: PropTypes.object, // deprecated way
    value: PropTypes.any, // redux-form
    onChange: PropTypes.func, // redux-form
    onBlur: PropTypes.func, // redux-form
    id: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      id: '',
      className: '',
      disabled: false,
    };
  },

  componentDidMount() {
    if (!this.props.disabled) {
      this._editor = new Quill(ReactDOM.findDOMNode(this.refs.editor), {
        modules: {
          'toolbar': {
            container: ReactDOM.findDOMNode(this.refs.toolbar),
          },
          'image-tooltip': {
            template: `
              <input class="input" type="textbox">
              <div class="preview">
                <span>${this.getIntlMessage('global.preview')}</span>
              </div>
              <a href="javascript:;" class="cancel">${this.getIntlMessage('global.cancel')}</a>
              <a href="javascript:;" class="insert">${this.getIntlMessage('global.insert')}</a>`,
          },
          'link-tooltip': {
            template: `
              <span class="title">${this.getIntlMessage('editor.url')}:&nbsp;</span>
              <a href="#" class="url" target="_blank" href="about:blank"></a>
              <input class="input" type="text">
              <span>&nbsp;&#45;&nbsp;</span>
              <a href="javascript:;" class="change">${this.getIntlMessage('global.change')}</a>
              <a href="javascript:;" class="remove">${this.getIntlMessage('global.remove')}</a>
              <a href="javascript:;" class="done">${this.getIntlMessage('global.done')}</a>`,
          },
        },
        styles: false,
        theme: 'snow',
      });
      this._editor.getModule('keyboard').removeHotkeys(9);

      if (this.props.valueLink) { // deprecated
        const defaultValue = this.props.valueLink.value;
        if (defaultValue) {
          this._editor.setHTML(defaultValue);
        }
        this._editor.on('text-change', () => {
          this.props.valueLink.requestChange(this._editor.getHTML());
        });
      } else {
        const defaultValue = this.props.value;
        if (defaultValue) {
          this._editor.setHTML(defaultValue);
        }
        this._editor.on('selection-change', (range) => {
          if (!range) {
            this.props.onBlur(this._editor.getHTML());
          }
        });
        this._editor.on('text-change', () => {
          this.props.onChange(this._editor.getHTML());
        });
      }
    }
  },

  componentWillUnmount() {
    if (this._editor) {
      this._editor.destroy();
    }
  },

  render() {
    const classes = {
      'editor': !this.props.disabled,
      'form-control': this.props.disabled,
      [this.props.className]: true,
    };
    if (this.props.disabled) {
      return (
        <textarea
          id={this.props.id}
          className={classNames(classes)}
          disabled
        >
        </textarea>
      );
    }
    return (
      <div id={this.props.id} className={classNames(classes)}>
        <QuillToolbar ref="toolbar" />
        <div ref="editor" style={{ position: 'static' }} />
      </div>
    );
  },
});

export default Editor;
