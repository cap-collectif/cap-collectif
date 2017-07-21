import React from 'react';
import { IntlMixin } from 'react-intl';

const QuillToolbar = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <div style={{ borderBottom: '1px solid #ddd', padding: '5px 12px' }}>
        <span className="ql-format-group">
          <select title="Size" className="ql-size">
            <option value="10px">{this.getIntlMessage('editor.size.small')}</option>
            <option value="13px" selected>{this.getIntlMessage('editor.size.normal')}</option>
            <option value="18px">{this.getIntlMessage('editor.size.large')}</option>
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
          <span title={this.getIntlMessage('editor.list')} className="ql-format-button ql-list" />
          <span className="ql-format-separator" />
          <span title={this.getIntlMessage('editor.bullet')} className="ql-format-button ql-bullet" />
          <span className="ql-format-separator" />
          <select title={this.getIntlMessage('editor.align.title')} className="ql-align">
            <option value="left" label={this.getIntlMessage('editor.align.left')} selected></option>
            <option value="center" label={this.getIntlMessage('editor.align.center')}></option>
            <option value="right" label={this.getIntlMessage('editor.align.right')}></option>
            <option value="justify" label={this.getIntlMessage('editor.align.justify')}></option>
          </select>
        </span>
        <span className="ql-format-group">
          <span title={this.getIntlMessage('editor.link')} className="ql-format-button ql-link" />
          <span className="ql-format-separator" />
          <span title={this.getIntlMessage('editor.image')} className="ql-format-button ql-image" />
        </span>
      </div>
    );
  },

});

export default QuillToolbar;
