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
            <a href="javascript:;" class="cancel">Annuler</a>
            <a href="javascript:;" class="insert">Ajouter</a>`,
        },
        'link-tooltip': {
          template: `
            <span class="title">Visiter l'URL:&nbsp;</span>
            <a href="#" class="url" target="_blank" href="about:blank"></a>
            <input class="input" type="text">
            <span>&nbsp;&#45;&nbsp;</span>
            <a href="javascript:;" class="change">Changer</a>
            <a href="javascript:;" class="remove">Supprimer</a>
            <a href="javascript:;" class="done">Terminé</a>`,
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
