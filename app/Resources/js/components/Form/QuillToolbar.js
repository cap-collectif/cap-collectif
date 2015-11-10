
export default class QuillToolbar extends React.Component {

  render() {
    return (
      <div style={{borderBottom: '1px solid #ddd', padding: '5px 12px'}}>
        <span className="ql-format-group">
          <select title="Size" className="ql-size">
            <option value="10px">Small</option>
            <option value="13px" selected>Normal</option>
            <option value="18px">Large</option>
            <option value="32px">Huge</option>
          </select>
        </span>
        <span className="ql-format-group">
          <span className="ql-format-button ql-bold" />
          <span className="ql-format-separator" />
          <span className="ql-format-button ql-italic" />
          <span className="ql-format-separator" />
          <span className="ql-format-button ql-underline" />
        </span>
        <span className="ql-format-group">
          <span title="List" className="ql-format-button ql-list" />
          <span className="ql-format-separator" />
          <span title="Bullet" className="ql-format-button ql-bullet" />
          <span className="ql-format-separator" />
          <select title="Text Alignment" className="ql-align">
            <option value="left" label="Left" selected></option>
            <option value="center" label="Center"></option>
            <option value="right" label="Right"></option>
            <option value="justify" label="Justify"></option>
          </select>
        </span>
        <span className="ql-format-group">
          <span title="Link" className="ql-format-button ql-link" />
          <span className="ql-format-separator" />
          <span title="Image" className="ql-format-button ql-image" />
        </span>
      </div>
    );
  }

}
