import QuillToolbar from './QuillToolbar';

const Input = ReactBootstrap.Input;

const QuillEditor = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    valueLink: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  componentDidMount() {

    let editor = new Quill('#editor', {
      theme: 'snow',
      modules: {
        'toolbar': { container: '#toolbar' },
        'link-tooltip': true,
      }
    });

    editor.on('text-change', (delta, source) => {
      if (source === 'api') {
        return;
      }
      this.props.valueLink.requestChange(editor.getHTML());
    });

    this.setState({editor: editor});
  },


  componentWillUnmount() {
    if (this.state.editor) {
      this.state.editor.destroy();
    }
  },

  /*        <QuillToolbar
          key="toolbar"
          ref="toolbar"
          items={ReactQuill.Toolbar.defaultItems}
        /
        */

  render() {
    return (
      <div style={{border: '1px solid #aaa', boxShadow: '0 0 2px 2px #ddd', margin: 'auto', minHeight: '200px'}}>
        <div id="toolbar" style={{backgroundColor: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '5px 12px'}}>
          <span className="ql-format-group">
            <select title="Size" className="ql-size">
              <option value="10px">Small</option>
              <option value="13px" selected>Normal</option>
              <option value="18px">Large</option>
              <option value="32px">Huge</option>
            </select>
          </span>
          <span className="ql-format-group">
            <button onClick={(e) => this.preventDefault(e)} className="ql-format-button ql-bold"></button>
            <span className="ql-format-separator" />
            <button onClick={(e) => this.preventDefault(e)} className="ql-format-button ql-italic"></button>
            <span className="ql-format-separator" />
            <button onClick={(e) => this.preventDefault(e)} className="ql-format-button ql-underline"></button>
          </span>
          <span className="ql-format-group">
            <span title="List" className="ql-format-button ql-list"></span>
            <span className="ql-format-separator"></span>
            <span title="Bullet" className="ql-format-button ql-bullet"></span>
            <span className="ql-format-separator"></span>
            <select title="Text Alignment" className="ql-align">
              <option value="left" label="Left" selected></option>
              <option value="center" label="Center"></option>
              <option value="right" label="Right"></option>
              <option value="justify" label="Justify"></option>
            </select>
          </span>
          <span className="ql-format-group">
            <span title="Link" className="ql-format-button ql-link"></span>
            <span className="ql-format-separator"></span>
            <span title="Image" className="ql-format-button ql-image"></span>
          </span>
        </div>
        <div id="editor" onChange={(e) => this.preventDefault(e)}></div>
      </div>
    );
  },

  preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
  }

});

export default QuillEditor;
