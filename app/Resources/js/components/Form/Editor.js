import QuillToolbar from './QuillToolbar';

const Editor = React.createClass({
  propTypes: {
    valueLink: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  componentDidMount() {
    this._editor = new Quill(React.findDOMNode(this.refs.editor), {
      modules: {
        'toolbar': { container: React.findDOMNode(this.refs.toolbar) },
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

    const defaultValue = this.props.valueLink.value;
    if (defaultValue) {
      this._editor.setHTML(defaultValue);
    }
    this._editor.on('text-change', () => {
      this.props.valueLink.requestChange(this._editor.getHTML());
    });
  },

  componentWillUnmount() {
    if (this._editor) {
      this._editor.destroy();
    }
  },

  render() {
    return (
      <div className="editor">
        <QuillToolbar ref="toolbar" />
        <div ref="editor" style={{position: 'static'}} />
      </div>
    );
  },
});

export default Editor;
