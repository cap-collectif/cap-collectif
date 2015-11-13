import QuillToolbar from './QuillToolbar';

const Editor = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired,
    help: React.PropTypes.node,
    errors: React.PropTypes.node,
    labelClassName: React.PropTypes.string,
    groupClassName: React.PropTypes.string,
    valueLink: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      labelClassName: '',
      groupClassName: '',
      help: null,
    };
  },

  componentDidMount() {
    this._editor = new Quill(React.findDOMNode(this.refs.editor), {
      modules: {
        'toolbar': { container: React.findDOMNode(this.refs.toolbar) },
        'image-tooltip': {
          template: `
            <input class="input" type="textbox">
            <div class="preview">
              <span>Preview</span>
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
      <div className={'form-group ' + this.props.groupClassName}>
        <label className={'control-label ' + this.props.labelClassName}>
          <span>{this.props.label}</span>
        </label>
        <span className="help-block">
          { this.props.help }
        </span>
        <div style={{border: '1px solid #ccc', margin: 'auto'}}>
          <QuillToolbar ref="toolbar" />
          <div ref="editor" />
        </div>
        <span>
          { this.props.errors }
        </span>
      </div>
    );
  },
});

export default Editor;
