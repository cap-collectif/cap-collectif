import React from 'react';
import ReactDOM from 'react-dom';
import autosize from 'autosize';
import { FormControl } from 'react-bootstrap';

const AutosizedTextarea = React.createClass({
  componentDidMount() {
    const input = ReactDOM.findDOMNode(this.refFormControl);
    autosize(input);
  },

  componentDidUpdate() {
    const input = ReactDOM.findDOMNode(this.refFormControl);
    autosize(input);
  },

  componentWillUnmount() {
    const input = ReactDOM.findDOMNode(this.refFormControl);
    autosize.destroy(input);
  },

  render() {
    return (
      <FormControl
        ref={c => {
          this.refFormControl = c;
        }}
        type="textarea"
        {...this.props}
      />
    );
  }
});

export default AutosizedTextarea;
