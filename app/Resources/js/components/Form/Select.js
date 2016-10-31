import React, { PropTypes } from 'react';
import Select from 'react-select';

export const renderSelect = React.createClass({
  propTypes: {
    input: PropTypes.any,
  },

  render() {
    const { input } = this.props;
    // console.log(input);
    return (
    <div className="form-group">
      <label htmlFor={input.name} className="col-sm-2 control-label">{ input.label }</label>
      <div className="col-sm-10">
        {
          typeof input.loadOptions === 'function'
            ? <Select.Async
                {...input}
                onBlur={() => { input.onBlur(input.value); }}
                onChange={event => { input.onChange(Array.isArray(event) ? event.map(e => e.value) : event); }}
            />
            : <Select {...input} onBlur={() => input.onBlur(input.value)} />
          }
          </div>
          </div>
    );
  },
});
